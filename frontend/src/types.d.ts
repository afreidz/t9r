/// <reference types="svelte-gestures" />

type Views = "list" | "timeline";
type Loadable = "tags" | "projects" | "settings" | "user";

declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onhold: () => void;
    onrelease: () => void;
  }
}
