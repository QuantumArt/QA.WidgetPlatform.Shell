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
  // Режим Stage
  isStage: boolean;
  // Фичи режима onscreen, которые нужно включить
  availableFeatures: AvailableFeatures[];
  // Имя куки, в которой хранится переопределенная для режима аб-тестов настройка isStage
  overrideAbTestStageModeCookieName: string;
  // Id жлемента для отслеживания изменений
  mutationWatcherElementId?: string;
}

export interface IAppSettingsShell extends IAppSettingsShellCore {
  publicPath: string;
  activeSiteMap?: boolean;
  activeSplashScreen?: boolean;
  onScreen: IOnScreenConfigurationOptions;
}
