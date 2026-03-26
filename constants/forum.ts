/**
 * NBM Forum — colors and layout from Figma (Authentication section, file NBM-Test).
 * SVG illustrations live under assets/images (imported where used).
 */

export const ForumColors = {
  purple: '#6537FF',
  charcoal: '#383939',
  white: '#FFFFFF',
  /** Field border — black @ 20% */
  border: 'rgba(1, 2, 20, 0.2)',
  /** Placeholder — black @ 40% */
  muted: 'rgba(1, 2, 20, 0.4)',
  error: '#C62828',
  /** Login error banner — red @ 20% (Figma red/red-200) */
  errorBanner: 'rgba(250, 100, 100, 0.2)',
  /** Settings list row background (Figma --grey) */
  settingsRow: '#EFEFEF',
} as const;

export const ForumLayout = {
  screenPadding: 24,
  maxContentWidth: 342,
  buttonPaddingVertical: 14,
  buttonPaddingHorizontal: 16,
  gapButtons: 8,
  gapSections: 32,
  inputPaddingVertical: 16,
  inputPaddingHorizontal: 12,
  progressSegmentHeight: 8,
  progressSegmentGap: 8,
} as const;
