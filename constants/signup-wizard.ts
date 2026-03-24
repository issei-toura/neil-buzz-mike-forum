export const SIGN_UP_STEPS = ['DETAILS', 'ADDRESS', 'SECURITY', 'PROFILE'] as const;

export type SignUpStep = (typeof SIGN_UP_STEPS)[number];

export const SIGNUP_STEP_META: Record<SignUpStep, { title: string; subtitle: string }> = {
  DETAILS: {
    title: 'Create your Account',
    subtitle: 'Enter your details below to start creating your brand new account.',
  },
  ADDRESS: {
    title: 'Where are you Located?',
    subtitle: 'Add your mailing address as it will be stored on your account.',
  },
  SECURITY: {
    title: "Let's Secure your Account",
    subtitle: "Let's keep your NBM account safe with a secure password.",
  },
  PROFILE: {
    title: 'Upload a Profile Picture',
    subtitle:
      "Let's put a name to a face. Upload a profile picture to complete your profile. This is an optional step.",
  },
};
