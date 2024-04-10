import React from 'react';
import { DivContents } from 'src/client/styles/global.styles';
import { useAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';
import { IAppSettingsShell } from 'src/share/app-settings-shell';

interface IProps<T extends object> {
  info: string;
  data: T;
  children: React.ReactNode;
}

const OnScreenBlock = <T extends object>(props: IProps<T>) => {
  const appSettingsShell = useAppSettingsShell() as IAppSettingsShell;
  const contents = React.createRef<HTMLDivElement>();
  React.useEffect(() => {
    if (!contents.current) {
      return;
    }
    const data = props.data ?? {};
    for (const dataKey in data) {
      contents.current.setAttribute(
        `data-${dataKey.toLowerCase()}`,
        data[dataKey]?.toString() ?? '',
      );
    }
  }, [contents.current]);

  if (!appSettingsShell.onScreen.active) {
    return <>{props.children}</>;
  }

  return (
    <DivContents ref={contents} data-info={props.info}>
      {props.children}
    </DivContents>
  );
};

export default OnScreenBlock;
