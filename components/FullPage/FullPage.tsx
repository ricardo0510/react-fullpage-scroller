import React, { useState, useEffect, useCallback, useRef, ReactElement } from 'react';
import { FullPageProps } from '../../types';
import { FullPageContext } from './FullPageContext';

/**
 * FullPage Component
 * 
 * Implements a fullscreen scrolling effect similar to fullpage.js.
 * Handles:
 * - Mouse Wheel scrolling
 * - Touch swipes (Mobile)
 * - Mouse Dragging (Desktop) - "Long Slider" style
 * - Keyboard navigation
 * - Transition animations
 * - Directional support (Vertical & Horizontal)
 */
export const FullPage: React.FC<FullPageProps> = ({ 
  children, 
  duration = 700, 
  onLeave,
  className = '',
  direction = 'vertical'
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  // Convert children to array to count them and access later
  const childrenArray = React.Children.toArray(children) as ReactElement[];
  const count = childrenArray.length;
  
  const isVertical = direction === 'vertical';

  // --- Drag State ---
  const isDragging = useRef(false);
  const startPos = useRef(0); // Generic start position (X or Y)
  const startTime = useRef(0);
  const currentDelta = useRef(0); // Generic delta

  // Helper to handle page transitions
  const scrollToPage = useCallback((targetPage: number) => {
    if (targetPage < 0 || targetPage >= count) return;
    if (isScrolling) return; // Debounce mechanism

    if (onLeave) {
      onLeave(currentPage, targetPage);
    }

    setIsScrolling(true);
    setCurrentPage(targetPage);

    // Reset scrolling lock after animation finishes
    setTimeout(() => {
      setIsScrolling(false);
    }, duration);
  }, [count, currentPage, isScrolling, duration, onLeave]);

  const next = useCallback(() => scrollToPage(currentPage + 1), [currentPage, scrollToPage]);
  const prev = useCallback(() => scrollToPage(currentPage - 1), [currentPage, scrollToPage]);
  const goTo = useCallback((page: number) => scrollToPage(page), [scrollToPage]);

  // --- Event Handlers ---

  // 1. Wheel Event (Mouse Scroll)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isDragging.current) return; // Ignore wheel during drag

      e.preventDefault(); // Prevent native scroll
      if (isScrolling) return;
      
      const delta = isVertical ? e.deltaY : (e.deltaX !== 0 ? e.deltaX : e.deltaY);

      // Determine direction
      // For horizontal, we typically map vertical scroll wheel to horizontal movement for better UX
      if (delta > 30) {
        next();
      } else if (delta < -30) {
        prev();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [next, prev, isScrolling, isVertical]);

  // 2. Keyboard Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDragging.current) return;

      const nextKeys = isVertical 
        ? ['ArrowDown', 'PageDown', ' '] 
        : ['ArrowRight', 'ArrowDown', 'PageDown', ' '];
      
      const prevKeys = isVertical 
        ? ['ArrowUp', 'PageUp'] 
        : ['ArrowLeft', 'ArrowUp', 'PageUp'];

      if (nextKeys.includes(e.key)) {
        e.preventDefault();
        next();
      } else if (prevKeys.includes(e.key)) {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev, isVertical]);

  // 3. Drag Logic (Touch & Mouse) - "Long Slider" Implementation

  const handleDragStart = (x: number, y: number, target: EventTarget) => {
    if (isScrolling) return;
    // Don't start drag if interacting with buttons, links, or inputs
    if ((target as HTMLElement).closest('button, a, input, textarea')) return;

    isDragging.current = true;
    startPos.current = isVertical ? y : x;
    startTime.current = Date.now();
    currentDelta.current = 0;

    // Disable transition for direct 1:1 movement follower
    if (innerRef.current) {
      innerRef.current.style.transitionDuration = '0ms';
    }
  };

  const handleDragMove = (x: number, y: number) => {
    if (!isDragging.current) return;

    const currentPos = isVertical ? y : x;
    const delta = currentPos - startPos.current;
    let effectiveDelta = delta;

    // Resistance/Rubber-banding at edges (first/last page)
    if ((currentPage === 0 && delta > 0) || (currentPage === count - 1 && delta < 0)) {
      effectiveDelta = delta * 0.35; 
    }

    currentDelta.current = effectiveDelta;

    if (innerRef.current) {
      // Apply transform manually to follow mouse
      // We combine percentage offset with pixel delta
      const offsetPct = currentPage * 100;
      const transform = isVertical 
        ? `translate3d(0, calc(-${offsetPct}% + ${effectiveDelta}px), 0)`
        : `translate3d(calc(-${offsetPct}% + ${effectiveDelta}px), 0, 0)`;
      
      innerRef.current.style.transform = transform;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const delta = currentDelta.current;
    const timeElapsed = Date.now() - startTime.current;
    
    // Velocity calculation: pixels per millisecond
    const velocity = Math.abs(delta) / (timeElapsed || 1); 

    const viewportSize = isVertical ? window.innerHeight : window.innerWidth;
    const threshold = viewportSize * 0.15; // 15% distance threshold to switch page
    const velocityThreshold = 0.35; // Velocity threshold for flick (px/ms)
    const minFlickDistance = 30; // Minimum distance for a flick to be valid

    // Restore transition for the snap animation
    if (innerRef.current) {
      innerRef.current.style.transitionDuration = `${duration}ms`;
    }

    const isValidFlick = velocity > velocityThreshold && Math.abs(delta) > minFlickDistance;
    const isPastThreshold = Math.abs(delta) > threshold;

    if (isPastThreshold || isValidFlick) {
      if (delta < 0 && currentPage < count - 1) {
        // Dragged Negative (Up/Left) -> Next Page
        scrollToPage(currentPage + 1);
      } else if (delta > 0 && currentPage > 0) {
        // Dragged Positive (Down/Right) -> Prev Page
        scrollToPage(currentPage - 1);
      } else {
        // Revert to current page (Boundary Bounce)
        resetPosition();
      }
    } else {
      // Revert to current page (Bounce back)
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

  // Ensure position is correct when direction changes or resize happens
  useEffect(() => {
    resetPosition();
  }, [direction, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse Event Wrappers
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY, e.target);
    window.addEventListener('mousemove', onMouseMoveWindow);
    window.addEventListener('mouseup', onMouseUpWindow);
  };

  // Window listeners for mouse move/up to handle dragging outside the viewport
  const onMouseMoveWindow = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const onMouseUpWindow = () => {
    handleDragEnd();
    window.removeEventListener('mousemove', onMouseMoveWindow);
    window.removeEventListener('mouseup', onMouseUpWindow);
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

  // Context value to be exposed to children
  const contextValue = {
    currentPage,
    count,
    next,
    prev,
    goTo,
    isScrolling,
    direction
  };

  return (
    <FullPageContext.Provider value={contextValue}>
      <div 
        ref={containerRef}
        className={`h-screen w-full overflow-hidden bg-gray-900 touch-none select-none ${className}`}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          ref={innerRef}
          className={`h-full w-full will-change-transform flex ${isVertical ? 'flex-col' : 'flex-row'}`}
          style={{ 
            transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
            transitionProperty: 'transform',
            transform: isVertical 
              ? `translate3d(0, -${currentPage * 100}%, 0)` 
              : `translate3d(-${currentPage * 100}%, 0, 0)`,
            transitionDuration: `${duration}ms`
          }}
        >
          {children}
        </div>
      </div>
    </FullPageContext.Provider>
  );
};