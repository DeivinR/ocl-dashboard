import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetToken } from '../../api/client';
import { getConversations, getMessages, createConversation, deleteConversation } from '../../api/conversations';

export const conversationKeys = {
  all: ['conversations'] as const,
  messages: (conversationId: string) => [...conversationKeys.all, 'messages', conversationId] as const,
};

export const useConversations = (getToken: GetToken, enabled = true) => {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: () => getConversations(getToken),
    enabled,
  });
};

export const useMessages = (conversationId: string | null, getToken: GetToken, enabled = true) => {
  return useQuery({
    queryKey: conversationId
      ? conversationKeys.messages(conversationId)
      : [...conversationKeys.all, 'messages', 'null'],
    queryFn: () => {
      if (!conversationId) throw new Error('No conversation ID');
      return getMessages(conversationId, getToken);
    },
    enabled: enabled && !!conversationId,
  });
};

export const useCreateConversation = (getToken: GetToken) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createConversation(getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
};

export const useDeleteConversation = (getToken: GetToken) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
};
