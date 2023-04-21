import type { Config } from "tailwindcss";
import twconfig from "../../tailwind.config.cjs";
import resolveConfig from "tailwindcss/resolveConfig";

export const config = resolveConfig(twconfig as Config);

const colorsArray = JSON.stringify(config.theme?.colors || {}).match(
  /#(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/g
);
export const colors = [...new Set(colorsArray)];

export const breakpoints = config.theme?.screens as { [k: string]: string };
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  xxl: `(min-width: ${breakpoints["2xl"]})`,
  xxxl: `(min-width: ${breakpoints["3xl"]})`,
};
