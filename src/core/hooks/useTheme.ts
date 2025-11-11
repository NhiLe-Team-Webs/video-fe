import {useMemo} from "react";
import type {CSSProperties} from "react";

export type ThemeConfig = {
  fontFamily?: string;
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  textStyle?: CSSProperties;
  overlayStyle?: CSSProperties;
};

export type Theme = Omit<ThemeConfig, "textStyle" | "overlayStyle"> & {
  textStyle: CSSProperties;
  overlayStyle: CSSProperties;
};

const DEFAULT_THEME: Required<Omit<ThemeConfig, "textStyle" | "overlayStyle">> = {
  fontFamily: "Inter, sans-serif",
  primaryColor: "#ffffff",
  backgroundColor: "#000000",
  accentColor: "#6366f1",
};

const BASE_TEXT_STYLE: CSSProperties = {
  fontWeight: 600,
};

const BASE_OVERLAY_STYLE: CSSProperties = {
  borderColor: DEFAULT_THEME.accentColor,
};

export const useTheme = (theme: ThemeConfig = {}): Theme => {
  return useMemo(() => {
    const merged = {...DEFAULT_THEME, ...theme};

    return {
      ...merged,
      textStyle: {
        ...BASE_TEXT_STYLE,
        fontFamily: merged.fontFamily,
        color: merged.primaryColor,
        ...theme.textStyle,
      },
      overlayStyle: {
        ...BASE_OVERLAY_STYLE,
        ...theme.overlayStyle,
      },
    };
  }, [theme]);
};
