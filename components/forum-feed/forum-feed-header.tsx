import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ForumColors, ForumLayout } from '@/constants/forum';

const CHIP_GAP = 8;

export type ForumFeedHeaderProps = {
  search: string;
  onSearchChange: (text: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  tagNames: string[];
  onPressCreate: () => void;
  onPressSettings: () => void;
};

export const ForumFeedHeader = memo(function ForumFeedHeader({
  search,
  onSearchChange,
  selectedTag,
  onSelectTag,
  tagNames,
  onPressCreate,
  onPressSettings,
}: ForumFeedHeaderProps) {
  return (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <Text style={styles.forumTitle}>Forum</Text>
        <View style={styles.topBarActions}>
          <Pressable
            onPress={onPressCreate}
            style={styles.iconHit}
            accessibilityRole="button"
            accessibilityLabel="Create new post">
            <MaterialIcons name="add" size={32} color={ForumColors.purple} />
          </Pressable>
          <Pressable
            onPress={onPressSettings}
            style={styles.iconHit}
            accessibilityRole="button"
            accessibilityLabel="Account">
            <MaterialIcons name="account-circle" size={32} color={ForumColors.purple} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color={ForumColors.charcoal} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search"
          placeholderTextColor="rgba(56, 57, 57, 0.4)"
          style={styles.searchInput}
          accessibilityLabel="Search posts"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        <Pressable
          onPress={() => onSelectTag(null)}
          style={[styles.chip, selectedTag === null && styles.chipActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedTag === null }}>
          <Text style={[styles.chipLabel, selectedTag === null && styles.chipLabelActive]}>All</Text>
        </Pressable>
        {tagNames.map((name) => (
          <Pressable
            key={name}
            onPress={() => onSelectTag(name)}
            style={[styles.chip, selectedTag === name && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedTag === name }}>
            <Text style={[styles.chipLabel, selectedTag === name && styles.chipLabelActive]}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  forumTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: ForumColors.charcoal,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ForumLayout.gapButtons,
  },
  iconHit: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 57, 57, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    maxWidth: ForumLayout.maxContentWidth + 48,
    alignSelf: 'stretch',
  },
  searchIcon: {
    opacity: 0.4,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: ForumColors.charcoal,
    padding: 0,
  },
  chipsScroll: {
    marginHorizontal: -ForumLayout.screenPadding,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CHIP_GAP,
    paddingHorizontal: ForumLayout.screenPadding,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(56, 57, 57, 0.1)',
  },
  chipActive: {
    backgroundColor: ForumColors.purple,
  },
  chipLabel: {
    fontSize: 14,
    color: ForumColors.charcoal,
  },
  chipLabelActive: {
    color: ForumColors.white,
  },
});
