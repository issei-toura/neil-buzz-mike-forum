import { ProfileAvatarPicker } from '@/components/profile-avatar-picker';

type Props = {
  profileUri: string | null;
  onProfileUriChange: (uri: string) => void;
};

export function SignUpProfileStep({ profileUri, onProfileUriChange }: Props) {
  return <ProfileAvatarPicker avatarUri={profileUri} onAvatarUriChange={onProfileUriChange} />;
}
