import React from 'react';

export const HrefContext = React.createContext<string | undefined>(undefined);

export const useHref = (): string | undefined =>
  typeof window === 'undefined'
    ? React.useContext(HrefContext)
    : window.location.href.slice(window.location.origin.length);
