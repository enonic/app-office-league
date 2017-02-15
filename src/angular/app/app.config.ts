export interface ConfigUser {
    key: string;
    displayName: string;
}

export interface Config {
    baseHref: string;
    idProvider: string;
    assetsUrl: string;
    loginUrl: string;
    logoutUrl: string;
    graphQlUrl: string;
    user: ConfigUser
}

declare var XPCONFIG: Config;

export {XPCONFIG};
