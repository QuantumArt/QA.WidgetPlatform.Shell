import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export type WPComponentProps = JSX.IntrinsicAttributes;

export interface IWPComponent {
  default: (props: WPComponentProps) => JSX.Element;
  allowedSubpage?: (tailUrl: string) => boolean;
  getStaticProps?: (
    props: { [key: string]: unknown },
    apolloClient?: ApolloClient<NormalizedCacheObject>,
  ) => { [key: string]: unknown };
}
