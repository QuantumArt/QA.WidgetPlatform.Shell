import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export type WPComponentProps = JSX.IntrinsicAttributes;

export interface IWPComponent {
  default: (props: WPComponentProps) => JSX.Element;
  getStaticProps?: (
    props: { [key: string]: unknown },
    apolloClient?: ApolloClient<NormalizedCacheObject>,
  ) => { [key: string]: unknown };
}
