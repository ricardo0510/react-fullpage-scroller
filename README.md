# React FullPage Scroller

A lightweight, performant, and responsive full-page scrolling library for React. It mimics the feel of native mobile scrolling ("Long Slider" effect) on desktop, supports touch devices, and offers both vertical and horizontal navigation.

## Features

- **🖱️ "Long Slider" Dragging:** Real-time 1:1 mouse/touch dragging with rubber-band resistance at edges.
- **🚀 Physics-based Flick:** Supports fast swipe gestures ("flick") to change pages even if the drag distance is short.
- **↔️ Bidirectional:** Supports both **Vertical** and **Horizontal** scrolling modes.
- **📱 Responsive:** Fully compatible with Mobile (Touch), Desktop (Mouse Wheel & Drag), and Keyboard navigation.
- **🧩 Overlay Support:** Automatically detects fixed headers/navbars and keeps them static while pages scroll.
- **🪝 React Hooks & Refs:** Control the slider via `useFullPage` hook (internal) or `ref` (external).
- **TypeScript:** Written in TypeScript with full type definitions.

## Installation

```bash
npm install react-fullpage-scroller
# or
yarn add react-fullpage-scroller
```

## Basic Usage

Import the `FullPage` and `Section` components.

```tsx
import React from "react";
import { FullPage, Section } from "react-fullpage-scroller";

const App = () => {
  return (
    <FullPage>
      <Section style={{ backgroundColor: "#3498db" }}>
        <h1>Page 1</h1>
      </Section>

      <Section style={{ backgroundColor: "#e74c3c" }}>
        <h1>Page 2</h1>
      </Section>

      <Section style={{ backgroundColor: "#2ecc71" }}>
        <h1>Page 3</h1>
      </Section>
    </FullPage>
  );
};
```

## Fixed Headers & Overlays

Any child component that is **not** a `<Section>` is treated as an overlay. It will be rendered outside the moving container, making it perfect for fixed headers, navigation dots, or persistent backgrounds.

```tsx
<FullPage>
  {/* This Header stays fixed at the top */}
  <header className="fixed top-0 left-0 p-4 z-50">My Fixed Header</header>

  <Section>Page 1</Section>
  <Section>Page 2</Section>
</FullPage>
```

## Props API

### `<FullPage />`

| Prop        | Type                         | Default      | Description                                  |
| ----------- | ---------------------------- | ------------ | -------------------------------------------- |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | The scrolling direction.                     |
| `duration`  | `number`                     | `700`        | Transition duration in milliseconds.         |
| `onLeave`   | `(origin, dest) => void`     | `undefined`  | Callback fired before the transition starts. |
| `className` | `string`                     | `''`         | CSS class for the outer container.           |
| `ref`       | `Ref<FullPageRef>`           | `undefined`  | Ref to access imperative API (see below).    |

### `<Section />`

| Prop        | Type            | Default     | Description                |
| ----------- | --------------- | ----------- | -------------------------- |
| `className` | `string`        | `''`        | CSS class for the section. |
| `style`     | `CSSProperties` | `undefined` | Inline styles.             |

## Controlling the Scroller

### 1. Internal Control (Hook)

Use the `useFullPage` hook within any component **inside** the `<FullPage>` provider.

```tsx
import { useFullPage } from "react-fullpage-scroller";

const NextButton = () => {
  const { next, prev, goTo, currentPage, count } = useFullPage();

  return (
    <button onClick={next}>
      Go Next ({currentPage + 1}/{count})
    </button>
  );
};
```

### 2. External Control (Ref)

Use a `ref` to control the scroller from **outside** the component tree.

```tsx
import { useRef } from "react";
import { FullPage, FullPageRef, Section } from "react-fullpage-scroller";

const App = () => {
  const fullPageRef = useRef<FullPageRef>(null);

  return (
    <>
      <button onClick={() => fullPageRef.current?.goTo(0)}>
        Reset to Start
      </button>

      <FullPage ref={fullPageRef}>
        <Section>1</Section>
        <Section>2</Section>
      </FullPage>
    </>
  );
};
```

## Horizontal Mode

Simply set the `direction` prop to `horizontal`. The library automatically adjusts mouse wheel behavior (vertical wheel scrolls horizontally) and keyboard arrows (Left/Right).

```tsx
<FullPage direction="horizontal">
  <Section>Slide 1</Section>
  <Section>Slide 2</Section>
</FullPage>
```

## Keyboard Support

| Key                                | Vertical Action | Horizontal Action |
| ---------------------------------- | --------------- | ----------------- |
| `ArrowDown` / `PageDown` / `Space` | Next Page       | Next Page         |
| `ArrowUp` / `PageUp`               | Prev Page       | Prev Page         |
| `ArrowRight`                       | -               | Next Page         |
| `ArrowLeft`                        | -               | Prev Page         |

## License

MIT
