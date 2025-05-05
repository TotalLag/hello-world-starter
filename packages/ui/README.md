# @hello-world/ui

Shared UI components for the Hello World Starter application.

## Button

A versatile button component for various actions.

**Props**

- `variant`: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'outline' | 'ghost' | 'link' — styling variant.
- `size`: 'sm' | 'md' | 'lg' | 'icon' — button size.
- `onPress`: `() => void` — function called when the button is pressed.
- `children`: `React.ReactNode` — content of the button.
- `disabled`: `boolean` — disables the button when `true`.
- `isLoading`: `boolean` — shows a loading indicator when `true`.
- `type?`: 'button' | 'submit' | 'reset' — HTML button type (optional).
- `...props`: `ButtonHTMLAttributes<HTMLButtonElement>` — other native button props.

**Usage Example**

```tsx
import { Button } from '@hello-world/ui';

// ...

<Button variant="primary" size="md" onPress={() => console.log('Pressed!')}>
  Click Me
</Button>;
```

## Installation / Import

This package is intended for internal use within the `hello-world-starter` monorepo and is automatically available to other packages and apps. There is no additional installation step.
