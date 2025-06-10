import { defineConfig } from "@pandacss/dev";
import { createPreset } from "~/shared/ui/kit";
import neutral from "~/shared/ui/kit/colors/neutral";
import purple from "~/shared/ui/kit/colors/purple";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [createPreset({ accentColor: purple, grayColor: neutral, radius: 'xl' })],
  jsxFramework: 'react',
  theme: {
    extend: {},
  },
  outdir: "styled-system",
});
