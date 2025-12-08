import React from "react";
import { SectionProps } from "./types";

/**
 * Section Component
 * Represents a single fullscreen page within the FullPage container.
 */
export const Section: React.FC<SectionProps> = ({
  children,
  className = "",
  style,
}) => {
  return (
    <div
      className={`h-full w-full flex-shrink-0 overflow-hidden relative ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Mark this component so FullPage knows it belongs in the scroll container
Section.isFullPageSection = true;
