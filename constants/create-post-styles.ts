import { ForumColors } from '@/constants/forum';

/** Figma: Syne Bold 25 / Charcoal (system sans when Syne is not bundled). */
export const createPostTitleFont = {
  fontSize: 25,
  fontWeight: '700' as const,
  color: ForumColors.charcoal,
};

/** Figma: body / category label scale */
export const createPostBodyFont = {
  fontSize: 14,
  fontWeight: '400' as const,
  color: ForumColors.charcoal,
};

export const createPostCategoryLabelFont = {
  fontSize: 18,
  fontWeight: '400' as const,
  color: 'rgba(56, 57, 57, 0.4)',
};

export const createPostPlaceholderMuted = 'rgba(56, 57, 57, 0.6)';

export const createPostCheckboxBorder = 'rgba(56, 57, 57, 0.2)';
