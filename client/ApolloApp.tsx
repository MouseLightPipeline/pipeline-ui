import * as React from "react";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "react-apollo-hooks";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";

import {PageLayout} from "./components/PageLayout";

const client = new ApolloClient({
    link: createHttpLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

export class ApolloApp extends React.Component<any, any> {
    render() {
        return (
            <ApolloHooksProvider client={client}>
                <ApolloProvider client={client}>
                    <PageLayout/>
                </ApolloProvider>
            </ApolloHooksProvider>
        );
    }
}
