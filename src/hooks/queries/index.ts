export { useDashboardData, useUpdateDashboard, dashboardKeys } from './useDashboard';
export { useProfile, profileKeys } from './useProfile';
export {
  useConversations,
  useMessages,
  useCreateConversation,
  useDeleteConversation,
  conversationKeys,
} from './useConversationsQuery';

import { dashboardKeys } from './useDashboard';
import { profileKeys } from './useProfile';
import { conversationKeys } from './useConversationsQuery';

export const queryKeys = {
  dashboard: dashboardKeys.all,
  profile: profileKeys.byId,
  conversations: conversationKeys.all,
  messages: conversationKeys.messages,
};
