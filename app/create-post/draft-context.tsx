import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type CreatePostDraft = {
  title: string;
  content: string;
  selectedTags: string[];
};

const emptyDraft: CreatePostDraft = { title: '', content: '', selectedTags: [] };

type CreatePostDraftContextValue = {
  draft: CreatePostDraft;
  setTitle: (value: string) => void;
  setContent: (value: string) => void;
  toggleTag: (name: string) => void;
  resetDraft: () => void;
};

const CreatePostDraftContext = createContext<CreatePostDraftContextValue | null>(null);

export function CreatePostDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<CreatePostDraft>(emptyDraft);

  const setTitle = useCallback((title: string) => {
    setDraft((d) => ({ ...d, title }));
  }, []);

  const setContent = useCallback((content: string) => {
    setDraft((d) => ({ ...d, content }));
  }, []);

  const toggleTag = useCallback((name: string) => {
    setDraft((d) => {
      const has = d.selectedTags.includes(name);
      return {
        ...d,
        selectedTags: has ? d.selectedTags.filter((t) => t !== name) : [...d.selectedTags, name],
      };
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft);
  }, []);

  const value = useMemo(
    () => ({ draft, setTitle, setContent, toggleTag, resetDraft }),
    [draft, setTitle, setContent, toggleTag, resetDraft]
  );

  return (
    <CreatePostDraftContext.Provider value={value}>{children}</CreatePostDraftContext.Provider>
  );
}

export function useCreatePostDraft() {
  const ctx = useContext(CreatePostDraftContext);
  if (!ctx) {
    throw new Error('useCreatePostDraft must be used within CreatePostDraftProvider');
  }
  return ctx;
}
