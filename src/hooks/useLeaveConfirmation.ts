"use client";

import { useEffect } from 'react';

export function useLeaveConfirmation(shouldWarn: boolean, message: string = 'Du har osparade ändringar. Är du säker på att du vill lämna sidan?') {
  useEffect(() => {
    if (!shouldWarn) return;

    // Hantera när fönstret stängs eller laddas om
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Hantera klick på interna Next.js länkar
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a');
      
      if (!target) return;
      
      const href = target.getAttribute('href');
      
      // Om länken går till en annan sida
      if (href && !href.startsWith('#') && href !== window.location.pathname) {
        if (!window.confirm(message)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    // Använd capture: true för att avbryta klicket innan Next.js hinner reagera
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [shouldWarn, message]);
}
