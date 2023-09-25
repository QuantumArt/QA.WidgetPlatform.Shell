import { IStaticPropsEnvironment } from './component-info';

export type WPComponentProps = JSX.IntrinsicAttributes;

export interface IWPComponent {
  default: (props: WPComponentProps) => JSX.Element;
  allowedSubpage?: (tailUrl: string, wpProps: { [key: string]: unknown }) => boolean;
  getStaticProps?: (
    props: { [key: string]: unknown },
    environment: IStaticPropsEnvironment,
  ) => { [key: string]: unknown };
}
