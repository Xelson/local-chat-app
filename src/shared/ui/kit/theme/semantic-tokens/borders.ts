import { defineSemanticTokens } from "@pandacss/dev";

export const borders = defineSemanticTokens.borders({
  default: { 
    value: '1px solid {colors.border.default}'
  },
});
