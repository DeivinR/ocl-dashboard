import { useState, useCallback, useRef, useEffect } from 'react';
import type { SliceData } from '@nivo/line';
import type { LineSeries } from '../services';

export const useDebouncedSlice = (isMobile: boolean, delay: number = 100) => {
  const [slice, setSlice] = useState<SliceData<LineSeries> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSliceChange = useCallback(
    (newSlice: SliceData<LineSeries> | null) => {
      if (isMobile) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setSlice(newSlice);
        }, delay);
      }
    },
    [isMobile, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { slice, handleSliceChange };
};
