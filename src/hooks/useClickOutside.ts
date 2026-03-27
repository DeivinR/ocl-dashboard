import { useEffect, type RefObject } from 'react';

function isInside(ref: RefObject<HTMLElement | null>, target: Node): boolean {
  return ref.current?.contains(target) ?? false;
}

export function useClickOutside(
  refOrRefs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onClose: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;
    const refs = Array.isArray(refOrRefs) ? refOrRefs : [refOrRefs];
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.some((ref) => isInside(ref, target))) return;
      onClose();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [refOrRefs, onClose, enabled]);
}
