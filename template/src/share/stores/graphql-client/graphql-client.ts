import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import {
  IGraphQLClient,
  IQueryOptions,
  IWPGraphqlQueryResult,
  OperationVariables,
} from '@quantumart/qp8-widget-platform-bridge';
import { IGraphQLSettings } from '@quantumart/qp8-widget-platform-shell-core';

export class GraphQLClient implements IGraphQLClient {
  private apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

  get hasGraphQL(): boolean {
    return !!this.apolloClient;
  }

  constructor(settingsGraphql: IGraphQLSettings | undefined) {
    if (!!settingsGraphql) {
      const headers: Record<string, string> = {};
      if (!!settingsGraphql.apiKey) {
        headers.apiKey = settingsGraphql.apiKey;
      }
      this.apolloClient = new ApolloClient<NormalizedCacheObject>({
        uri: settingsGraphql.apiUrl,
        headers: headers,
        cache: new InMemoryCache(),
      });
    }
  }

  query<T = any, TVariables extends OperationVariables = OperationVariables>(
    options: IQueryOptions<TVariables, T>,
  ): Promise<IWPGraphqlQueryResult<T>> {
    return this.apolloClient!.query(options);
  }
}
