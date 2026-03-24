import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ForumColors } from '@/constants/forum';

const CRITERIA_BG = '#E9E9E9';

type Props = {
  profileUri: string | null;
  onPickImage: () => void;
};

export function SignUpProfileStep({ profileUri, onPickImage }: Props) {
  return (
    <>
      {!profileUri ? (
        <Pressable
          style={styles.uploadZone}
          onPress={onPickImage}
          accessibilityRole="button"
          accessibilityLabel="Select profile picture">
          <Ionicons name="cloud-upload-outline" size={24} color={ForumColors.charcoal} />
          <View style={styles.uploadCopy}>
            <Text style={styles.uploadTitle}>Select a file</Text>
            <Text style={styles.uploadHint}>JPG or PNG, file size no more than 10MB</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.profilePreview}>
          <Image
            source={{ uri: profileUri }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.editLinkColumn}>
            <Pressable onPress={onPickImage} accessibilityRole="button">
              <Text style={styles.editPictureLink}>Edit profile picture</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  uploadZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    minHeight: 106,
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ForumColors.charcoal,
    marginBottom: 8,
  },
  uploadCopy: {
    flex: 1,
    gap: 4,
    opacity: 0.7,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  uploadHint: {
    fontSize: 16,
    fontWeight: '400',
    color: ForumColors.charcoal,
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 16,
  },
  profileImage: {
    width: 183,
    height: 183,
    borderRadius: 999,
    backgroundColor: CRITERIA_BG,
  },
  editLinkColumn: {
    flex: 1,
    minHeight: 183,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPictureLink: {
    fontSize: 14,
    fontWeight: '500',
    color: ForumColors.purple,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
