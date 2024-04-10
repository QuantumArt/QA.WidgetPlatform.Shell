import { FieldInfo, WidgetDetails } from "@quantumart/qp8-widget-platform-shell-core";

export interface WPWidgetDetails extends WidgetDetails {
  staticProps?: Record<string, FieldInfo>;
}
