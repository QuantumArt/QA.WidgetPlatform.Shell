//@ts-nocheck

export const staticModules = {
  qp_widgets_platform_modules: {
    //pages
    start_page: () => import('qp_widgets_platform_modules/start_page'),
    text_page: () => import('qp_widgets_platform_modules/text_page'),
    //widgets
    html_widget: () => import('qp_widgets_platform_modules/html_widget'),
  },
};
