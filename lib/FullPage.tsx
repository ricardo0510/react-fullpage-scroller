import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactElement,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { FullPageProps, FullPageRef } from "./types";
import { FullPageContext } from "./FullPageContext";

/**
 * FullPage Component
 *
 * Optimized for performance:
 * - Uses requestAnimationFrame for drag updates (60fps).
 * - Memoizes children and context to prevent unnecessary re-renders.
 * - Forces GPU acceleration via CSS.
 */
export const FullPage = forwardRef<FullPageRef, FullPageProps>(
  (
    {
      children,
      duration = 700,
      onLeave,
      className = "",
      direction = "vertical",
    },
    ref
  ) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    // Performance: Memoize children splitting logic to avoid re-calculation on every render
    const { slides, overlays } = useMemo(() => {
      const childrenArray = React.Children.toArray(children) as ReactElement[];
      const s: ReactElement[] = [];
      const o: ReactElement[] = [];

      childrenArray.forEach((child) => {
        // Check for the static property we added to Section
        if (
          React.isValidElement(child) &&
          (child.type as any).isFullPageSection
        ) {
          s.push(child);
        } else {
          o.push(child);
        }
      });
      return { slides: s, overlays: o };
    }, [children]);

    const count = slides.length;
    const isVertical = direction === "vertical";

    // --- Drag State ---
    const isDragging = useRef(false);
    const startPos = useRef(0); // Generic start position (X or Y)
    const startTime = useRef(0);
    const currentDelta = useRef(0); // Generic delta

    // Performance: rAF Reference to throttle visual updates
    const rafRef = useRef<number | null>(null);
    const latestDragPos = useRef<{ x: number; y: number } | null>(null);

    // Helper to handle page transitions
    const scrollToPage = useCallback(
      (targetPage: number) => {
        if (targetPage < 0 || targetPage >= count) return;
        if (isScrolling) return;

        if (onLeave) {
          onLeave(currentPage, targetPage);
        }

        setIsScrolling(true);
        setCurrentPage(targetPage);

        // Reset scrolling lock after animation finishes
        setTimeout(() => {
          setIsScrolling(false);
        }, duration);
      },
      [count, currentPage, isScrolling, duration, onLeave]
    );

    const next = useCallback(
      () => scrollToPage(currentPage + 1),
      [currentPage, scrollToPage]
    );
    const prev = useCallback(
      () => scrollToPage(currentPage - 1),
      [currentPage, scrollToPage]
    );
    const goTo = useCallback(
      (page: number) => scrollToPage(page),
      [scrollToPage]
    );

    // --- Expose API via Ref ---
    useImperativeHandle(ref, () => ({
      next,
      prev,
      goTo,
      getCurrentPage: () => currentPage,
      getCount: () => count,
    }));

    // --- Event Handlers ---

    // 1. Wheel Event (Mouse Scroll)
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (isDragging.current) return;

        e.preventDefault();
        if (isScrolling) return;

        const delta = isVertical
          ? e.deltaY
          : e.deltaX !== 0
          ? e.deltaX
          : e.deltaY;

        if (delta > 30) {
          next();
        } else if (delta < -30) {
          prev();
        }
      };

      const container = containerRef.current;
      if (container) {
        // Passive: false is required to preventDefault
        container.addEventListener("wheel", handleWheel, { passive: false });
      }

      return () => {
        if (container) {
          container.removeEventListener("wheel", handleWheel);
        }
      };
    }, [next, prev, isScrolling, isVertical]);

    // 2. Keyboard Event
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (isDragging.current) return;

        const nextKeys = isVertical
          ? ["ArrowDown", "PageDown", " "]
          : ["ArrowRight", "ArrowDown", "PageDown", " "];

        const prevKeys = isVertical
          ? ["ArrowUp", "PageUp"]
          : ["ArrowLeft", "ArrowUp", "PageUp"];

        if (nextKeys.includes(e.key)) {
          e.preventDefault();
          next();
        } else if (prevKeys.includes(e.key)) {
          e.preventDefault();
          prev();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [next, prev, isVertical]);

    // 3. Drag Logic (Touch & Mouse) - Optimized with rAF

    const handleDragStart = (x: number, y: number, target: EventTarget) => {
      if (isScrolling) return;
      if ((target as HTMLElement).closest("button, a, input, textarea")) return;

      isDragging.current = true;
      startPos.current = isVertical ? y : x;
      startTime.current = Date.now();
      currentDelta.current = 0;
      latestDragPos.current = { x, y };

      if (innerRef.current) {
        innerRef.current.style.transitionDuration = "0ms";
        innerRef.current.style.willChange = "transform"; // Hint browser for incoming changes
      }
    };

    // Performance: Core update logic extracted to run inside rAF
    const updateDragVisuals = () => {
      if (!isDragging.current || !latestDragPos.current || !innerRef.current) {
        rafRef.current = null;
        return;
      }

      const { x, y } = latestDragPos.current;
      const currentPos = isVertical ? y : x;
      const delta = currentPos - startPos.current;
      let effectiveDelta = delta;

      // Resistance at edges
      if (
        (currentPage === 0 && delta > 0) ||
        (currentPage === count - 1 && delta < 0)
      ) {
        effectiveDelta = delta * 0.35;
      }

      currentDelta.current = effectiveDelta;

      const offsetPct = currentPage * 100;
      // Use translate3d to ensure GPU layer promotion
      const transform = isVertical
        ? `translate3d(0, calc(-${offsetPct}% + ${effectiveDelta}px), 0)`
        : `translate3d(calc(-${offsetPct}% + ${effectiveDelta}px), 0, 0)`;

      innerRef.current.style.transform = transform;

      rafRef.current = null;
    };

    const handleDragMove = (x: number, y: number) => {
      if (!isDragging.current) return;

      latestDragPos.current = { x, y };

      // Throttle: Only schedule a frame if one isn't already pending
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateDragVisuals);
      }
    };

    const handleDragEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      // Cancel any pending rAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const delta = currentDelta.current;
      const timeElapsed = Date.now() - startTime.current;

      const velocity = Math.abs(delta) / (timeElapsed || 1);

      const viewportSize = isVertical ? window.innerHeight : window.innerWidth;
      const threshold = viewportSize * 0.15;
      const velocityThreshold = 0.35;
      const minFlickDistance = 30;

      if (innerRef.current) {
        innerRef.current.style.transitionDuration = `${duration}ms`;
        innerRef.current.style.willChange = "auto"; // Remove hint to save memory
      }

      const isValidFlick =
        velocity > velocityThreshold && Math.abs(delta) > minFlickDistance;
      const isPastThreshold = Math.abs(delta) > threshold;

      if (isPastThreshold || isValidFlick) {
        if (delta < 0 && currentPage < count - 1) {
          scrollToPage(currentPage + 1);
        } else if (delta > 0 && currentPage > 0) {
          scrollToPage(currentPage - 1);
        } else {
          resetPosition();
        }
      } else {
        resetPosition();
      }
    };

    const resetPosition = () => {
      if (innerRef.current) {
        const offsetPct = currentPage * 100;
        innerRef.current.style.transform = isVertical
          ? `translate3d(0, -${offsetPct}%, 0)`
          : `translate3d(-${offsetPct}%, 0, 0)`;
      }
    };

    useEffect(() => {
      resetPosition();
    }, [direction, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Mouse Event Wrappers
    const onMouseDown = (e: React.MouseEvent) => {
      handleDragStart(e.clientX, e.clientY, e.target);
      window.addEventListener("mousemove", onMouseMoveWindow);
      window.addEventListener("mouseup", onMouseUpWindow);
    };

    const onMouseMoveWindow = (e: MouseEvent) =>
      handleDragMove(e.clientX, e.clientY);
    const onMouseUpWindow = () => {
      handleDragEnd();
      window.removeEventListener("mousemove", onMouseMoveWindow);
      window.removeEventListener("mouseup", onMouseUpWindow);
    };

    // Touch Event Wrappers
    const onTouchStart = (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    };
    const onTouchMove = (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      handleDragEnd();
    };

    // Performance: Memoize context to avoid re-rendering consumers (Dots, custom hooks)
    const contextValue = useMemo(
      () => ({
        currentPage,
        count,
        next,
        prev,
        goTo,
        isScrolling,
        direction,
      }),
      [currentPage, count, next, prev, goTo, isScrolling, direction]
    );

    return (
      <FullPageContext.Provider value={contextValue}>
        <div
          ref={containerRef}
          className={`h-screen w-full overflow-hidden bg-gray-900 touch-none select-none ${className}`}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          // Force GPU layer for the container too
          style={{ perspective: "1000px" }}
        >
          {overlays}

          <div
            ref={innerRef}
            className={`h-full w-full flex ${
              isVertical ? "flex-col" : "flex-row"
            }`}
            style={{
              transitionTimingFunction:
                "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
              transitionProperty: "transform",
              transform: isVertical
                ? `translate3d(0, -${currentPage * 100}%, 0)`
                : `translate3d(-${currentPage * 100}%, 0, 0)`,
              transitionDuration: `${duration}ms`,
              // Hardware acceleration hints
              backfaceVisibility: "hidden",
              perspective: "1000px",
            }}
          >
            {slides}
          </div>
        </div>
      </FullPageContext.Provider>
    );
  }
);

FullPage.displayName = "FullPage";
