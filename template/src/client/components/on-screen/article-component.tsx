import React from 'react';
import { IOnScreenArticleComponentProps } from '@quantumart/qp8-widget-platform-bridge';
import OnScreenBlock from './on-screen-block';

const ArticleComponent = (props: IOnScreenArticleComponentProps): JSX.Element => {
  return (
    <OnScreenBlock
      key={props.contentId}
      info={`article`}
      data={{
        id: props.contentId,
        title: props.title,
        contentId: props.contentId,
        published: props.published,
      }}
    >
      {props.children}
    </OnScreenBlock>
  );
};

export default ArticleComponent;
