import resolveConfig from "tailwindcss/resolveConfig";

const config = resolveConfig({
  theme: {},
  content: [],
}) as unknown;

const { theme } = config as { theme: { colors: unknown } };

const colorsArray = JSON.stringify(theme.colors).match(
  /#(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/g
);

export const colors = [...new Set(colorsArray)];
