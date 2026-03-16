import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Conversation } from '../interfaces/conversation';
import {
  getConversations,
  createConversation,
  getMessages,
  deleteConversation,
  updateConversation,
} from '../api/conversations';

export const conversationKeys = {
  all: ['conversations'],
  messages: (id: string) => [...conversationKeys.all, id, 'messages'],
};

export function useConversations(getAccessToken: () => Promise<string | null>) {
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const query = useQuery({
    queryKey: conversationKeys.all,
    queryFn: () => getConversations(() => getAccessTokenRef.current()),
    retry: false,
    refetchOnWindowFocus: false,
  });

  let error: string | null = null;
  if (query.error) {
    error = query.error instanceof Error ? query.error.message : 'Failed to load conversations';
  }
  return {
    conversations: query.data ?? [],
    loading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}

export function useCreateConversation(getAccessToken: () => Promise<string | null>) {
  const queryClient = useQueryClient();
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  return useMutation<Conversation, Error, void>({
    mutationFn: () => createConversation(() => getAccessTokenRef.current()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useMessages(conversationId: string | null, getAccessToken: () => Promise<string | null>) {
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  return useQuery({
    queryKey: conversationId ? conversationKeys.messages(conversationId) : ['conversations', 'messages', 'disabled'],
    queryFn: () => getMessages(conversationId!, () => getAccessTokenRef.current()),
    enabled: !!conversationId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateConversation(getAccessToken: () => Promise<string | null>) {
  const queryClient = useQueryClient();
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  return useMutation<Conversation, Error, { conversationId: string; title: string }>({
    mutationFn: ({ conversationId, title }) =>
      updateConversation(conversationId, { title }, () => getAccessTokenRef.current()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useDeleteConversation(getAccessToken: () => Promise<string | null>) {
  const queryClient = useQueryClient();
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  return useMutation<void, Error, string>({
    mutationFn: (conversationId) => deleteConversation(conversationId, () => getAccessTokenRef.current()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
