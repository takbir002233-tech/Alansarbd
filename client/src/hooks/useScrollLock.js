import { useEffect } from 'react';

let lockCount = 0;

export function lockBodyScroll() {
  lockCount++;
  if (lockCount === 1) {
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  }
}

export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }
}

export default function useScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
