import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import type { GetToken } from '../../api/client';
import { uploadGoalsFile } from '../../api/goals';

export const useUploadGoalsFile = (getToken: GetToken) => {
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMutation<void, Error, File>({
    mutationFn: (file) => uploadGoalsFile(() => getTokenRef.current(), file),
  });
};
