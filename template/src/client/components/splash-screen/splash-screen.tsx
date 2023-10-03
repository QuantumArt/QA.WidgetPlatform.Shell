import React from 'react';
import { SplashScreenContext, SplashScreenLoader, SplashScreenRing } from './splash-screen.styles';

interface IProps {
  active: boolean;
  children: JSX.Element | null;
}

export const SplashScreen = (props: IProps): JSX.Element | null => {
  const [firstLoop, setFirstLoop] = React.useState('true');
  React.useEffect(() => {
    setFirstLoop('false');
  }, []);

  if (!props.active) {
    return props.children;
  }

  return (
    <>
      <SplashScreenLoader $firstloop={firstLoop}>
        <SplashScreenRing />
      </SplashScreenLoader>
      <SplashScreenContext $firstloop={firstLoop}>{props.children}</SplashScreenContext>
    </>
  );
};
