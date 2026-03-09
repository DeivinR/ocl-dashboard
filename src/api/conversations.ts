import type { GetToken } from './client';
import { createAuthFetch } from './client';
import type { Conversation } from '../interfaces/conversation';
import type { Message } from '../interfaces/message';

export async function getConversations(getToken: GetToken): Promise<Conversation[]> {
  const res = await createAuthFetch(getToken)('/conversations');
  return res.json();
}

export async function getMessages(conversationId: string, getToken: GetToken): Promise<Message[]> {
  const res = await createAuthFetch(getToken)(`/conversations/${conversationId}/messages`);
  return res.json();
}

export async function createConversation(getToken: GetToken): Promise<Conversation> {
  const res = await createAuthFetch(getToken)('/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res.json();
}

export async function deleteConversation(conversationId: string, getToken: GetToken): Promise<void> {
  await createAuthFetch(getToken)(`/conversations/${conversationId}`, { method: 'DELETE' });
}
