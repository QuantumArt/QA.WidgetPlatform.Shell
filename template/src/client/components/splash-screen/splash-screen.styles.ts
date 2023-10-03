import styled, { keyframes } from 'styled-components';

interface SplashScreenLoaderProps {
  $firstloop: string;
}

export const SplashScreenLoader = styled.div<SplashScreenLoaderProps>`
  display: ${props => (props.$firstloop === 'true' ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 16px;
  height: 100vh;
`;

const splashScreenLoader = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const SplashScreenRing = styled.div`
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #0a2896;
  border-color: #0a2896 transparent #0a2896 transparent;
  animation: ${splashScreenLoader} 1.2s linear infinite;
`;

interface SplashScreenContextProps {
  $firstloop: string;
}
export const SplashScreenContext = styled.div<SplashScreenContextProps>`
  display: ${props => (props.$firstloop === 'true' ? 'none' : 'auto')};
`;
