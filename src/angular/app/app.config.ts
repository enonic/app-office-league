export interface ConfigUser {
    key: string;
    playerId: string;
    playerName: string;
}

export interface Config {
    locale: string;
    baseHref: string;
    idProvider: string;
    assetsUrl: string;
    loginUrl: string;
    logoutUrl: string;
    graphQlUrl: string;
    setImageUrl: string;
    user: ConfigUser
}

declare var XPCONFIG: Config;

export {XPCONFIG};
