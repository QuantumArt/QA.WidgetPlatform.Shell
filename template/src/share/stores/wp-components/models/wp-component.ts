import { IGraphQLClient } from '@quantumart/qp8-widget-platform-bridge';

export type WPComponentProps = JSX.IntrinsicAttributes;

export interface IWPComponent {
  default: (props: WPComponentProps) => JSX.Element;
  allowedSubpage?: (tailUrl: string) => boolean;
  getStaticProps?: (
    props: { [key: string]: unknown },
    environment: {
      href: string;
      graphQLClient: IGraphQLClient;
    },
  ) => { [key: string]: unknown };
}
