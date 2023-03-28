declare module "@crownframework/svelte-error-boundary";

type MoveableState = {
  x: number;
  y: number;
  moved: boolean;
};

type Views = "list" | "timeline" | "report";
