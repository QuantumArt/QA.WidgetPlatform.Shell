import React from 'react';

export const HrefContext = React.createContext<string | undefined>(undefined);

export const useHref = (): string | undefined => {
  const hrefStr =
    typeof window === 'undefined'
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ? React.useContext(HrefContext)
      : window.location.href.slice(window.location.origin.length);
  //Убираем якорь c url
  return hrefStr?.replace(/#.*/, '');
};
