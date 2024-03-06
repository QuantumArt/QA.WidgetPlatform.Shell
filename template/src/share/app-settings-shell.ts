import { IAppSettingsShell as IAppSettingsShellCore } from '@quantumart/qp8-widget-platform-shell-core';

export enum AvailableFeatures {
  Widgets = 'Widgets',
  //AbTests = 'AbTests',
}

export interface IOnScreenConfigurationOptions {
  //OnScreen активен
  active: boolean;
  // Урл компонента Onscreen API (админка onscreen), который работает с тем же QP, что и сайт
  adminSiteBaseUrl: string;
  // Id сайта в QP
  siteId: number;
  // Режим Stage
  isStage: boolean;
  // Кастомер-код базы сайта в QP
  customerCode: string;
  // Фичи режима onscreen, которые нужно включить
  availableFeatures: AvailableFeatures[];
  // Имя куки, в которой хранится информация об аутентификации onscreen
  authCookieName: string;
  // Имя куки, в которой хранится переопределенная для режима аб-тестов настройка isStage
  overrideAbTestStageModeCookieName: string;
}

export interface IAppSettingsShell extends IAppSettingsShellCore {
  publicPath: string;
  activeSiteMap?: boolean;
  activeSplashScreen?: boolean;
  onScreen: IOnScreenConfigurationOptions;
}
