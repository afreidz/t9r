import { writable } from "svelte/store";
import { mediaQueries } from "@/lib/theme";

type BreakpointValues = {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
  xxxl: boolean;
};

const queries: BreakpointValues = {
  sm: window.matchMedia(mediaQueries.sm).matches,
  md: window.matchMedia(mediaQueries.md).matches,
  lg: window.matchMedia(mediaQueries.lg).matches,
  xl: window.matchMedia(mediaQueries.xl).matches,
  xxl: window.matchMedia(mediaQueries.xxl).matches,
  xxxl: window.matchMedia(mediaQueries.xxxl).matches,
};

const breakpoints = writable<BreakpointValues>(queries);
window.addEventListener("resize", () => {
  breakpoints.update(() => ({
    sm: window.matchMedia(mediaQueries.sm).matches,
    md: window.matchMedia(mediaQueries.md).matches,
    lg: window.matchMedia(mediaQueries.lg).matches,
    xl: window.matchMedia(mediaQueries.xl).matches,
    xxl: window.matchMedia(mediaQueries.xxl).matches,
    xxxl: window.matchMedia(mediaQueries.xxxl).matches,
  }));
});

export default breakpoints;
