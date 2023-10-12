import { IAppSettingsShell as IAppSettingsShellCore } from '@quantumart/qp8-widget-platform-shell-core';

export interface IAppSettingsShell extends IAppSettingsShellCore {
  publicPath: string;
  activeSiteMap?: boolean;
  activeSplashScreen?: boolean;
}
