import {useMemo} from "react";
import type {CSSProperties} from "react";

export type ThemeConfig = {
  fontFamily?: string;
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
};

export type Theme = ThemeConfig & {
  textStyle: CSSProperties;
  overlayStyle: CSSProperties;
};

const DEFAULT_THEME: Required<ThemeConfig> = {
  fontFamily: "Inter, sans-serif",
  primaryColor: "#ffffff",
  backgroundColor: "#000000",
  accentColor: "#6366f1",
};

export const useTheme = (theme: ThemeConfig = {}): Theme => {
  return useMemo(() => {
    const merged = {...DEFAULT_THEME, ...theme};

    return {
      ...merged,
      textStyle: {
        fontFamily: merged.fontFamily,
        color: merged.primaryColor,
        fontWeight: 600,
      },
      overlayStyle: {
        borderColor: merged.accentColor,
      },
    };
  }, [theme]);
};
