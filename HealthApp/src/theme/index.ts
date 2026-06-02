export const Theme = {
  colors: {
    primary: '#4CAF50',
    primaryLight: '#81C784',
    primaryDark: '#388E3C',
    primaryGradient: ['#43A047', '#66BB6A'],
    primaryGradientStart: '#43A047',
    primaryGradientEnd: '#66BB6A',

    accent: '#FF9800',
    accentLight: '#FFB74D',
    accentDark: '#F57C00',
    accentGradient: ['#FF9800', '#FFB74D'],

    danger: '#EF5350',
    dangerLight: '#FFCDD2',
    dangerGradient: ['#EF5350', '#FF7043'],

    info: '#42A5F5',
    infoLight: '#90CAF9',
    infoGradient: ['#42A5F5', '#64B5F6'],

    purple: '#AB47BC',
    purpleLight: '#CE93D8',
    purpleGradient: ['#AB47BC', '#CE93D8'],

    text: {
      primary: '#1A1A2E',
      secondary: '#4A4A6A',
      tertiary: '#8E8EA0',
      white: '#FFFFFF',
      light: '#B0B0C0',
    },

    background: {
      primary: '#F5F7FA',
      card: '#FFFFFF',
      cardDark: '#1A1A2E',
      input: '#F0F2F5',
      overlay: 'rgba(0,0,0,0.4)',
    },

    border: {
      light: '#F0F0F5',
      medium: '#E0E0EA',
      dark: '#C0C0D0',
    },

    shadow: {
      light: 'rgba(0,0,0,0.04)',
      medium: 'rgba(0,0,0,0.08)',
      heavy: 'rgba(0,0,0,0.12)',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  cardShadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
