/// <reference types="svelte-gestures" />

type Views = "list" | "timeline";

declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onhold: () => void;
    onrelease: () => void;
  }
}
