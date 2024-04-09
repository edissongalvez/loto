const tintColorLight = 'rgba(52, 199, 89, 1)'
const tintColorDark = 'rgba(48, 209, 88, 1)'

export default {
  light: {
    textPrimary: 'rgba(0, 0, 0, 1)',
    textSecondary: 'rgba(60, 60, 67, .6)',
    textTertiary: 'rgba(60, 60, 67, .3)',
    textQuaternary: 'rgba(60, 60, 67, .18)',
    background: 'rgba(255, 255, 255, 1)',
    tint: tintColorLight,
    tabIconDefault: 'rgba(153, 153, 153, 1)',
    tabIconSelected: tintColorLight,
  },
  dark: {
    textPrimary: 'rgba(255, 255, 255, 1)',
    textSecondary: 'rgba(235, 235, 245, .6)',
    textTertiary: 'rgba(235, 235, 245, .3)',
    textQuaternary: 'rgba(235, 235, 245, .16)',
    background: 'rgba(0, 0, 0, 1)',
    tint: tintColorDark,
    tabIconDefault: 'rgba(153, 153, 153, 1)',
    tabIconSelected: tintColorDark,
  },
};
