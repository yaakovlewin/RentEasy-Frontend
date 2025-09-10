/**
 * @fileoverview Design Token System
 * 
 * Enterprise-grade design token system following patterns from Material Design,
 * Fluent Design, and major design systems like Shopify Polaris and Atlassian.
 * 
 * Features comprehensive token management, theme switching, responsive design,
 * and type-safe token consumption.
 */

/**
 * Core design token categories
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  layout: LayoutTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  motion: MotionTokens;
  breakpoints: BreakpointTokens;
  zIndex: ZIndexTokens;
}

/**
 * Color token system with semantic naming
 */
export interface ColorTokens {
  // Primary brand colors
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  
  // Semantic colors
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  
  // Neutral colors
  neutral: ColorScale;
  surface: ColorScale;
  
  // Property-specific colors
  property: {
    featured: string;
    available: string;
    booked: string;
    unavailable: string;
    premium: string;
  };
  
  // Interactive states
  interactive: {
    hover: string;
    active: string;
    focus: string;
    disabled: string;
    selected: string;
  };
  
  // Overlay and backdrop
  overlay: {
    light: string;
    medium: string;
    heavy: string;
    backdrop: string;
  };
}

/**
 * Color scale interface for systematic color progression
 */
export interface ColorScale {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
  '950': string;
}

/**
 * Typography token system with semantic hierarchy
 */
export interface TypographyTokens {
  // Font families
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
    display: string[];
  };
  
  // Font weights
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  
  // Font sizes with line heights
  fontSize: {
    xs: { size: string; lineHeight: string };
    sm: { size: string; lineHeight: string };
    base: { size: string; lineHeight: string };
    lg: { size: string; lineHeight: string };
    xl: { size: string; lineHeight: string };
    '2xl': { size: string; lineHeight: string };
    '3xl': { size: string; lineHeight: string };
    '4xl': { size: string; lineHeight: string };
    '5xl': { size: string; lineHeight: string };
    '6xl': { size: string; lineHeight: string };
    '7xl': { size: string; lineHeight: string };
    '8xl': { size: string; lineHeight: string };
    '9xl': { size: string; lineHeight: string };
  };
  
  // Semantic typography scales
  heading: {
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    h4: TypographyStyle;
    h5: TypographyStyle;
    h6: TypographyStyle;
  };
  
  body: {
    large: TypographyStyle;
    base: TypographyStyle;
    small: TypographyStyle;
    xs: TypographyStyle;
  };
  
  // Property-specific typography
  property: {
    title: TypographyStyle;
    subtitle: TypographyStyle;
    price: TypographyStyle;
    description: TypographyStyle;
    amenity: TypographyStyle;
    metadata: TypographyStyle;
  };
}

/**
 * Typography style definition
 */
export interface TypographyStyle {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Spacing token system with consistent scale
 */
export interface SpacingTokens {
  // Base spacing scale
  '0': string;
  '0.5': string;
  '1': string;
  '1.5': string;
  '2': string;
  '2.5': string;
  '3': string;
  '3.5': string;
  '4': string;
  '5': string;
  '6': string;
  '7': string;
  '8': string;
  '9': string;
  '10': string;
  '11': string;
  '12': string;
  '14': string;
  '16': string;
  '20': string;
  '24': string;
  '28': string;
  '32': string;
  '36': string;
  '40': string;
  '44': string;
  '48': string;
  '52': string;
  '56': string;
  '60': string;
  '64': string;
  '72': string;
  '80': string;
  '96': string;
  
  // Semantic spacing
  component: {
    padding: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    margin: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    gap: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  
  // Property-specific spacing
  property: {
    cardPadding: string;
    cardGap: string;
    sectionSpacing: string;
    contentSpacing: string;
    imageSpacing: string;
  };
}

/**
 * Layout token system
 */
export interface LayoutTokens {
  // Container widths
  container: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    full: string;
  };
  
  // Grid system
  grid: {
    columns: number;
    gap: string;
    gutters: {
      sm: string;
      md: string;
      lg: string;
    };
  };
  
  // Property-specific layouts
  property: {
    cardWidth: {
      sm: string;
      md: string;
      lg: string;
    };
    galleryAspect: {
      hero: string;
      card: string;
      thumbnail: string;
    };
    contentMaxWidth: string;
  };
}

/**
 * Shadow token system
 */
export interface ShadowTokens {
  // Base shadows
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
  
  // Semantic shadows
  card: {
    rest: string;
    hover: string;
    active: string;
    focus: string;
  };
  
  // Property-specific shadows
  property: {
    card: string;
    cardHover: string;
    gallery: string;
    modal: string;
  };
  
  // Interactive shadows
  interactive: {
    button: string;
    buttonHover: string;
    input: string;
    inputFocus: string;
  };
}

/**
 * Border token system
 */
export interface BorderTokens {
  // Border widths
  width: {
    '0': string;
    '1': string;
    '2': string;
    '4': string;
    '8': string;
  };
  
  // Border radius
  radius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  
  // Border styles
  style: {
    solid: string;
    dashed: string;
    dotted: string;
    double: string;
    none: string;
  };
  
  // Property-specific borders
  property: {
    card: {
      width: string;
      radius: string;
      color: string;
    };
    input: {
      width: string;
      radius: string;
      color: string;
      focusColor: string;
    };
  };
}

/**
 * Motion and animation token system
 */
export interface MotionTokens {
  // Durations
  duration: {
    instant: string;
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  
  // Easing functions
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
  };
  
  // Property-specific animations
  property: {
    cardHover: {
      duration: string;
      easing: string;
      transform: string;
    };
    imageTransition: {
      duration: string;
      easing: string;
    };
    modalAnimation: {
      duration: string;
      easing: string;
    };
  };
}

/**
 * Breakpoint token system
 */
export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  
  // Property-specific breakpoints
  property: {
    cardSingle: string;
    cardDouble: string;
    cardTriple: string;
    galleryMobile: string;
    galleryTablet: string;
    galleryDesktop: string;
  };
}

/**
 * Z-index token system
 */
export interface ZIndexTokens {
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
  
  // Property-specific z-indices
  property: {
    imageOverlay: number;
    galleryControls: number;
    bookingCard: number;
    imageModal: number;
  };
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  name: string;
  tokens: DesignTokens;
  mode: 'light' | 'dark';
}

/**
 * Default light theme tokens
 */
export const lightThemeTokens: DesignTokens = {
  colors: {
    primary: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
      '950': '#172554',
    },
    secondary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a',
      '950': '#020617',
    },
    accent: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
      '950': '#052e16',
    },
    success: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
      '950': '#052e16',
    },
    warning: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f59e0b',
      '600': '#d97706',
      '700': '#b45309',
      '800': '#92400e',
      '900': '#78350f',
      '950': '#451a03',
    },
    error: {
      '50': '#fef2f2',
      '100': '#fee2e2',
      '200': '#fecaca',
      '300': '#fca5a5',
      '400': '#f87171',
      '500': '#ef4444',
      '600': '#dc2626',
      '700': '#b91c1c',
      '800': '#991b1b',
      '900': '#7f1d1d',
      '950': '#450a0a',
    },
    info: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
      '950': '#172554',
    },
    neutral: {
      '50': '#fafafa',
      '100': '#f4f4f5',
      '200': '#e4e4e7',
      '300': '#d4d4d8',
      '400': '#a1a1aa',
      '500': '#71717a',
      '600': '#52525b',
      '700': '#3f3f46',
      '800': '#27272a',
      '900': '#18181b',
      '950': '#09090b',
    },
    surface: {
      '50': '#ffffff',
      '100': '#fefefe',
      '200': '#fafafa',
      '300': '#f4f4f5',
      '400': '#e4e4e7',
      '500': '#d4d4d8',
      '600': '#a1a1aa',
      '700': '#71717a',
      '800': '#52525b',
      '900': '#3f3f46',
      '950': '#27272a',
    },
    property: {
      featured: '#3b82f6',
      available: '#22c55e',
      booked: '#f59e0b',
      unavailable: '#ef4444',
      premium: '#8b5cf6',
    },
    interactive: {
      hover: 'rgba(0, 0, 0, 0.05)',
      active: 'rgba(0, 0, 0, 0.1)',
      focus: 'rgba(59, 130, 246, 0.1)',
      disabled: 'rgba(0, 0, 0, 0.05)',
      selected: 'rgba(59, 130, 246, 0.1)',
    },
    overlay: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.25)',
      heavy: 'rgba(0, 0, 0, 0.5)',
      backdrop: 'rgba(0, 0, 0, 0.75)',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' },
      sm: { size: '0.875rem', lineHeight: '1.25rem' },
      base: { size: '1rem', lineHeight: '1.5rem' },
      lg: { size: '1.125rem', lineHeight: '1.75rem' },
      xl: { size: '1.25rem', lineHeight: '1.75rem' },
      '2xl': { size: '1.5rem', lineHeight: '2rem' },
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
      '5xl': { size: '3rem', lineHeight: '1' },
      '6xl': { size: '3.75rem', lineHeight: '1' },
      '7xl': { size: '4.5rem', lineHeight: '1' },
      '8xl': { size: '6rem', lineHeight: '1' },
      '9xl': { size: '8rem', lineHeight: '1' },
    },
    heading: {
      h1: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600 },
      h4: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 600 },
      h5: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 500 },
      h6: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 500 },
    },
    body: {
      large: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 400 },
      base: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 400 },
      small: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
      xs: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: 400 },
    },
    property: {
      title: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600 },
      subtitle: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 500 },
      price: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 },
      description: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 400 },
      amenity: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
      metadata: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: 400 },
    },
  },
  
  spacing: {
    '0': '0rem',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '3.5': '0.875rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem',
    component: {
      padding: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      margin: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      gap: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
    },
    property: {
      cardPadding: '1.5rem',
      cardGap: '1rem',
      sectionSpacing: '3rem',
      contentSpacing: '1.5rem',
      imageSpacing: '1rem',
    },
  },
  
  layout: {
    container: {
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      '7xl': '80rem',
      full: '100%',
    },
    grid: {
      columns: 12,
      gap: '1.5rem',
      gutters: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
    property: {
      cardWidth: {
        sm: '280px',
        md: '320px',
        lg: '360px',
      },
      galleryAspect: {
        hero: '16/9',
        card: '4/3',
        thumbnail: '1/1',
      },
      contentMaxWidth: '1200px',
    },
  },
  
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
    card: {
      rest: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      hover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      active: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      focus: '0 0 0 3px rgb(59 130 246 / 0.1)',
    },
    property: {
      card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      gallery: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
    interactive: {
      button: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      buttonHover: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      input: 'inset 0 0 0 1px rgb(0 0 0 / 0.05)',
      inputFocus: '0 0 0 3px rgb(59 130 246 / 0.1)',
    },
  },
  
  borders: {
    width: {
      '0': '0px',
      '1': '1px',
      '2': '2px',
      '4': '4px',
      '8': '8px',
    },
    radius: {
      none: '0px',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    style: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
      double: 'double',
      none: 'none',
    },
    property: {
      card: {
        width: '1px',
        radius: '0.75rem',
        color: 'rgb(228 228 231)',
      },
      input: {
        width: '1px',
        radius: '0.5rem',
        color: 'rgb(209 213 219)',
        focusColor: 'rgb(59 130 246)',
      },
    },
  },
  
  motion: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    property: {
      cardHover: {
        duration: '250ms',
        easing: 'cubic-bezier(0, 0, 0.2, 1)',
        transform: 'translateY(-2px)',
      },
      imageTransition: {
        duration: '300ms',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      modalAnimation: {
        duration: '200ms',
        easing: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    property: {
      cardSingle: '640px',
      cardDouble: '1024px',
      cardTriple: '1280px',
      galleryMobile: '640px',
      galleryTablet: '1024px',
      galleryDesktop: '1280px',
    },
  },
  
  zIndex: {
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
    property: {
      imageOverlay: 10,
      galleryControls: 20,
      bookingCard: 30,
      imageModal: 1400,
    },
  },
};

/**
 * Dark theme tokens (inherits from light theme with overrides)
 */
export const darkThemeTokens: DesignTokens = {
  ...lightThemeTokens,
  colors: {
    ...lightThemeTokens.colors,
    // Override specific colors for dark mode
    surface: {
      '50': '#09090b',
      '100': '#18181b',
      '200': '#27272a',
      '300': '#3f3f46',
      '400': '#52525b',
      '500': '#71717a',
      '600': '#a1a1aa',
      '700': '#d4d4d8',
      '800': '#e4e4e7',
      '900': '#f4f4f5',
      '950': '#fafafa',
    },
    neutral: {
      '50': '#fafafa',
      '100': '#f4f4f5',
      '200': '#e4e4e7',
      '300': '#d4d4d8',
      '400': '#a1a1aa',
      '500': '#71717a',
      '600': '#52525b',
      '700': '#3f3f46',
      '800': '#27272a',
      '900': '#18181b',
      '950': '#09090b',
    },
    interactive: {
      hover: 'rgba(255, 255, 255, 0.05)',
      active: 'rgba(255, 255, 255, 0.1)',
      focus: 'rgba(59, 130, 246, 0.2)',
      disabled: 'rgba(255, 255, 255, 0.05)',
      selected: 'rgba(59, 130, 246, 0.2)',
    },
    overlay: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.25)',
      heavy: 'rgba(255, 255, 255, 0.5)',
      backdrop: 'rgba(0, 0, 0, 0.9)',
    },
  },
};

/**
 * Theme configurations
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  tokens: lightThemeTokens,
  mode: 'light',
};

export const darkTheme: ThemeConfig = {
  name: 'dark',
  tokens: darkThemeTokens,
  mode: 'dark',
};

/**
 * Default theme
 */
export const defaultTheme = lightTheme;

/**
 * Design token system class
 */
export class DesignTokenSystem {
  private currentTheme: ThemeConfig = defaultTheme;
  private customTokens: Partial<DesignTokens> = {};
  
  constructor(theme: ThemeConfig = defaultTheme) {
    this.currentTheme = theme;
  }
  
  /**
   * Get current theme
   */
  getTheme(): ThemeConfig {
    return this.currentTheme;
  }
  
  /**
   * Set theme
   */
  setTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
  }
  
  /**
   * Get design tokens
   */
  getTokens(): DesignTokens {
    return {
      ...this.currentTheme.tokens,
      ...this.customTokens,
    };
  }
  
  /**
   * Get specific token value by path
   */
  getToken(path: string): any {
    const tokens = this.getTokens();
    return this.getNestedValue(tokens, path);
  }
  
  /**
   * Set custom token overrides
   */
  setCustomTokens(tokens: Partial<DesignTokens>): void {
    this.customTokens = { ...this.customTokens, ...tokens };
  }
  
  /**
   * Generate CSS custom properties
   */
  generateCSSCustomProperties(prefix: string = '--'): Record<string, string> {
    const tokens = this.getTokens();
    const cssProperties: Record<string, string> = {};
    
    this.flattenTokens(tokens, cssProperties, prefix);
    return cssProperties;
  }
  
  /**
   * Generate Tailwind CSS configuration
   */
  generateTailwindConfig(): Record<string, any> {
    const tokens = this.getTokens();
    
    return {
      colors: this.transformColorsForTailwind(tokens.colors),
      fontFamily: tokens.typography.fontFamily,
      fontSize: this.transformFontSizeForTailwind(tokens.typography.fontSize),
      fontWeight: tokens.typography.fontWeight,
      spacing: tokens.spacing,
      boxShadow: tokens.shadows,
      borderRadius: tokens.borders.radius,
      screens: tokens.breakpoints,
      zIndex: tokens.zIndex,
      transitionDuration: tokens.motion.duration,
      transitionTimingFunction: tokens.motion.easing,
    };
  }
  
  /**
   * Get responsive token value
   */
  getResponsiveToken(basePath: string, breakpoint: keyof BreakpointTokens): any {
    const responsiveOverrides = this.getToken('responsive') || [];
    const override = responsiveOverrides.find((r: any) => 
      r.breakpoint === this.getToken(`breakpoints.${breakpoint}`)
    );
    
    if (override && this.getNestedValue(override, basePath.split('.').slice(-1)[0])) {
      return this.getNestedValue(override, basePath.split('.').slice(-1)[0]);
    }
    
    return this.getToken(basePath);
  }
  
  /**
   * Helper method to get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Helper method to flatten tokens into CSS custom properties
   */
  private flattenTokens(
    obj: any, 
    result: Record<string, string>, 
    prefix: string, 
    currentPath: string = ''
  ): void {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newPath = currentPath ? `${currentPath}-${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenTokens(value, result, prefix, newPath);
      } else {
        result[`${prefix}${newPath}`] = String(value);
      }
    });
  }
  
  /**
   * Transform colors for Tailwind CSS
   */
  private transformColorsForTailwind(colors: ColorTokens): any {
    const transformed: any = {};
    
    Object.keys(colors).forEach(key => {
      const colorValue = colors[key as keyof ColorTokens];
      if (typeof colorValue === 'object' && colorValue !== null) {
        transformed[key] = colorValue;
      }
    });
    
    return transformed;
  }
  
  /**
   * Transform fontSize for Tailwind CSS
   */
  private transformFontSizeForTailwind(fontSize: TypographyTokens['fontSize']): any {
    const transformed: any = {};
    
    Object.keys(fontSize).forEach(key => {
      const sizeValue = fontSize[key as keyof TypographyTokens['fontSize']];
      transformed[key] = [sizeValue.size, { lineHeight: sizeValue.lineHeight }];
    });
    
    return transformed;
  }
}

/**
 * Default design token system instance
 */
export const designTokenSystem = new DesignTokenSystem();

/**
 * Convenience functions for token access
 */
export const getToken = (path: string) => designTokenSystem.getToken(path);
export const getTheme = () => designTokenSystem.getTheme();
export const setTheme = (theme: ThemeConfig) => designTokenSystem.setTheme(theme);

/**
 * Property-specific token access functions
 */
export const getPropertyTokens = () => ({
  colors: getToken('colors.property'),
  typography: getToken('typography.property'),
  spacing: getToken('spacing.property'),
  layout: getToken('layout.property'),
  shadows: getToken('shadows.property'),
  borders: getToken('borders.property'),
  motion: getToken('motion.property'),
  breakpoints: getToken('breakpoints.property'),
  zIndex: getToken('zIndex.property'),
});

export const getComponentTokens = () => ({
  spacing: getToken('spacing.component'),
  shadows: getToken('shadows.card'),
  borders: getToken('borders.property'),
  motion: getToken('motion.property'),
});