export interface ConfigUser {
    key: string;
    playerId: string;
    playerName: string;
    playerImageUrl: string;
}

export interface Config {
    locale: string;
    baseHref: string;
    idProvider: string;
    assetsUrl: string;
    audioUrl: string;
    loginUrl: string;
    logoutUrl: string;
    logoutMarketingUrl: string;
    graphQlUrl: string;
    setImageUrl: string;
    liveGameUrl: string;
    user: ConfigUser
}

declare var XPCONFIG: Config;

export {XPCONFIG};
