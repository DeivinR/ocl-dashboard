import type { GetToken } from './client';
import { createAuthFetch } from './client';

export async function uploadGCAFile(getToken: GetToken, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  await createAuthFetch(getToken)('/gca/upload', {
    method: 'POST',
    body: formData,
  });
}
