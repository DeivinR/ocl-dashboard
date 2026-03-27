import type { GetToken } from './client';
import { createAuthFetch } from './client';

export async function uploadGoalsFile(getToken: GetToken, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  await createAuthFetch(getToken)('/goals/upload', {
    method: 'POST',
    body: formData,
  });
}
