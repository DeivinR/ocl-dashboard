import type { GetToken } from './client';
import { createAuthFetch } from './client';

export async function uploadPhotoBaseFile(getToken: GetToken, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  await createAuthFetch(getToken)('/photo-base/upload', {
    method: 'POST',
    body: formData,
  });
}

