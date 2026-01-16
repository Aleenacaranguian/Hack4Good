import { StyleSheet } from 'react-native';

// Color palette
export const Colors = {
  // Primary colors
  primary: '#dc2626',
  primaryLight: '#fee',
  primaryDark: '#b91c1c',

  // Secondary colors
  secondary: '#fa8072',
  secondaryLight: '#FFB6C1',

  // Status colors
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FF9F43',
  danger: '#f44336',
  purple: '#9C27B0',

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8f9fa',
  gray100: '#f5f5f5',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#d1d5db',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#1a1a1a',

  // Specific uses
  background: '#f8f9fa',
  border: '#e0e0e0',
  text: '#1a1a1a',
  textLight: '#666',
  textGray: '#6b7280',
};

// Common button styles
export const ButtonStyles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primary: {
    backgroundColor: Colors.danger,
  },
  success: {
    backgroundColor: Colors.success,
  },
  info: {
    backgroundColor: Colors.info,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  purple: {
    backgroundColor: Colors.purple,
  },
  secondary: {
    backgroundColor: Colors.secondaryLight,
  },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
});

// Common text styles
export const TextStyles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  bodyLight: {
    fontSize: 16,
    color: Colors.textLight,
  },
  small: {
    fontSize: 14,
    color: Colors.textLight,
  },
  caption: {
    fontSize: 12,
    color: Colors.gray600,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextSmall: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextLarge: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
});

// Common container styles
export const ContainerStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSmall: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLarge: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRounded: {
    backgroundColor: Colors.white,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  section: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Common input styles
export const InputStyles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: Colors.gray400,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  rounded: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.gray50,
  },
  multiline: {
    textAlignVertical: 'top',
    maxHeight: 100,
  },
});

// Common modal styles
export const ModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  contentCenter: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    maxWidth: '90%',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 20,
  },
});

// Common list item styles
export const ListItemStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    marginBottom: 12,
  },
  withBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  elevated: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

// Spacing utilities
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius utilities
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

// Shadow utilities
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default {
  Colors,
  ButtonStyles,
  TextStyles,
  ContainerStyles,
  InputStyles,
  ModalStyles,
  ListItemStyles,
  Spacing,
  BorderRadius,
  Shadows,
};
