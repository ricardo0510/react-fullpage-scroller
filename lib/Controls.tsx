import React from "react";
import { useFullPage } from "./FullPageContext";

export const NavigationDots: React.FC = () => {
  const { currentPage, count, goTo, direction } = useFullPage();

  const isVertical = direction === "vertical";

  const containerClasses = isVertical
    ? "fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50"
    : "fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-row gap-4 z-50";

  return (
    <div className={containerClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => goTo(index)}
          aria-label={`Go to section ${index + 1}`}
          className={`
            w-3 h-3 rounded-full transition-all duration-300 ease-in-out
            ${
              currentPage === index
                ? "bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                : "bg-white/40 hover:bg-white/70 hover:scale-110"
            }
          `}
        />
      ))}
    </div>
  );
};
