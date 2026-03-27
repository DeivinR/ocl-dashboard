import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import type { GetToken } from '../../api/client';
import { uploadPhotoBaseFile } from '../../api/photoBase';

export const useUploadPhotoBaseFile = (getToken: GetToken) => {
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMutation<void, Error, File>({
    mutationFn: (file) => uploadPhotoBaseFile(() => getTokenRef.current(), file),
  });
};

