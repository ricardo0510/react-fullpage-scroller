import { ReactNode, CSSProperties } from 'react';

export type FullPageDirection = 'vertical' | 'horizontal';

export interface FullPageProps {
  children: ReactNode;
  duration?: number; // Animation duration in ms
  onLeave?: (origin: number, destination: number) => void;
  className?: string;
  direction?: FullPageDirection;
}

export interface SectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface FullPageContextType {
  currentPage: number;
  count: number;
  next: () => void;
  prev: () => void;
  goTo: (page: number) => void;
  isScrolling: boolean;
  direction: FullPageDirection;
}