import { IAppSettingsShell } from '@quantumart/qp8-widget-platform-shell-core';

export const loadSettingsFromFile = async (): Promise<IAppSettingsShell> => {
  const setting = await fetch(`${process.env.wpPlatform.publicPath}settings.json`).then(s =>
    s.json(),
  );

  if (!!process.env.wpPlatform.standalone && !!setting) {
    delete setting.ssr;
  }

  return setting as IAppSettingsShell;
};
