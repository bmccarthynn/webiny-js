import React from "react";
import { ApolloProvider } from "@apollo/react-components";
import { createApolloClient } from "./apolloClient";
import { useRef } from "react";

export const withApolloClient = () => Component => {
    return function WithApolloClient({ children, ...props }) {
        const clientRef = useRef(
            createApolloClient({ uri: process.env.REACT_APP_GRAPHQL_API_URL })
        );

        return (
            <ApolloProvider client={clientRef.current}>
                <Component {...props}>{children}</Component>
            </ApolloProvider>
        );
    };
};
