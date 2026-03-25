import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors } from '@/constants/forum';

const AVATAR_SIZE = 140;

type ProfileAvatarPickerProps = {
  avatarUri: string | null;
  onAvatarUriChange: (uri: string) => void;
};

export function ProfileAvatarPicker({ avatarUri, onAvatarUriChange }: ProfileAvatarPickerProps) {
  const pickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onAvatarUriChange(result.assets[0].uri);
    }
  }, [onAvatarUriChange]);

  return (
    <View style={styles.profileRow}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialIcons name="person" size={56} color={ForumColors.muted} />
        </View>
      )}
      <Pressable onPress={pickAvatar} style={styles.editPhotoWrap} accessibilityRole="button">
        <Text style={styles.editPhotoText}>Edit profile picture</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    backgroundColor: ForumColors.settingsRow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  editPhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: ForumColors.purple,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
