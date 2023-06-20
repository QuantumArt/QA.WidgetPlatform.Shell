import { IAppSettingsShell } from '@qp8-widget-platform/shell-core';

export const loadSettingsFromFile = (): Promise<IAppSettingsShell> =>
  fetch(`${process.env.wpPlatform.publicPath}settings.json`).then(s => s.json());
