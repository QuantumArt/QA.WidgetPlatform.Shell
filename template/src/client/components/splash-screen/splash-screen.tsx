import React from 'react';

interface IProps {
  children: JSX.Element | null;
}

export const SplashScreen = (props: IProps): JSX.Element | null => {
  const [firstLoop, setFirstLoop] = React.useState(true);
  React.useEffect(() => {
    setFirstLoop(false);
  }, []);

  if (firstLoop) {
    return (
      <>
        <style>{`
        .splash-screen-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            height: 100vh;
        }

        .splash-screen-ring {
            display: block;
            width: 64px;
            height: 64px;
            margin: 8px;
            border-radius: 50%;
            border: 6px solid #0a2896;
            border-color: #0a2896 transparent #0a2896 transparent;
            animation: splash-screen-ring 1.2s linear infinite;
        }
          
        @keyframes splash-screen-ring {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
        }

        .splash-screen-context {
            display: none;
        }
        `}</style>
        <div className="splash-screen-loader">
          <div className="splash-screen-ring"> </div>
        </div>
        <div className="splash-screen-context">{props.children}</div>
      </>
    );
  }

  return props.children;
};
