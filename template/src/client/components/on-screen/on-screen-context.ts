export enum OnScreenFeatures {
  /// <summary>
  /// OnScreen недоступен для сайта
  /// </summary>
  None = 'None',
  /// <summary>
  /// Доступна фича OnScreen для работы с виджетами и зонами
  /// </summary>
  Widgets = 'Widgets',
  /// <summary>
  /// Доступна фича OnScreen для работы с AB-тестами
  /// </summary>
  AbTests = 'AbTests',
}

export interface OnScreenUser {
  userId: number;
  expirationDate: Date;
}

export interface IOnScreenContext {
  /// <summary>
  /// Доступные фичи OnScreen
  /// </summary>
  features: OnScreenFeatures;

  /// <summary>
  /// Текущий пользователь
  /// </summary>
  user: OnScreenUser;

  /// <summary>
  /// Переопределенное для режима onscreen значение isStage для получения данных по АБ-тестам
  /// </summary>
  abtestsIsStageOverrided?: boolean;

  /// <summary>
  /// Типы виджетов, которые надо игнорировать в режиме onscreen (не подсвечивать, обрамлять рамками итд)
  /// </summary>
  skipWidgetTypes: string[];

  /// <summary>
  /// Id страницы
  /// </summary>
  pageId?: number;

  /// <summary>
  /// Кастомер-код базы сайта в QP
  /// </summary>
  customerCode: string;
}
