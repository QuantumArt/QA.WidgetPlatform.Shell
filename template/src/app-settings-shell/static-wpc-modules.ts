//@ts-nocheck

export const staticModules = {
  qp_widgets_platform_modules: {
    //pages
    start_page: () => import('qp_widgets_platform_modules/start_page'),
    redirect_page: () => import('qp_widgets_platform_modules/redirect_page'),
    text_page: () => import('qp_widgets_platform_modules/text_page'),
    media_page: () => import('qp_widgets_platform_modules/media_page'),
    news_page: () => import('qp_widgets_platform_modules/news_page'),
    search_result_page: () => import('qp_widgets_platform_modules/search_result_page'),
    sitemap_page: () => import('qp_widgets_platform_modules/sitemap_page'),
    //widgets
    html_widget: () => import('qp_widgets_platform_modules/html_widget'),
    search_bar_widget: () => import('qp_widgets_platform_modules/search_bar_widget'),
    foldboxlist_widget: () => import('qp_widgets_platform_modules/foldboxlist_widget'),
    subscribe_widget: () => import('qp_widgets_platform_modules/subscribe_widget'),
    feedback_widget: () => import('qp_widgets_platform_modules/feedback_widget'),
    banner_widget: () => import('qp_widgets_platform_modules/banner_widget'),
    newsroom_widget: () => import('qp_widgets_platform_modules/newsroom_widget'),
    top_menu_widget: () => import('qp_widgets_platform_modules/top_menu_widget'),
  },
};
