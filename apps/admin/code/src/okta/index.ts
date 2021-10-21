import OktaSignIn from "@okta/okta-signin-widget";
import { OktaAuth } from "@okta/okta-auth-js";
import "@okta/okta-signin-widget/dist/css/okta-sign-in.min.css";
import logo from "./webiny-orange-logo.svg";

const oktaDomain = `https://dev-844500.oktapreview.com`;
const clientId = "0oa1149zslypdjy5B0h8";
const redirectUri = window.location.origin + "/";

// These scopes are required to populate all the necessary user data on the API side.
const scopes = ["openid", "email", "profile"];

const oktaSignIn = new OktaSignIn({
    // Additional documentation on config options can be found at https://github.com/okta/okta-signin-widget#basic-config-options
    baseUrl: oktaDomain,
    clientId,
    redirectUri,
    logo,
    authParams: {
        scopes
    }
});

const oktaAuth = new OktaAuth({
    issuer: `${oktaDomain}/oauth2/default`,
    clientId,
    redirectUri,
    scopes,
    pkce: true,
    restoreOriginalUri: null,
    // devMode: process.env.NODE_ENV === "development"
});

export { oktaSignIn, oktaAuth };
