export interface ConfigUser {
    key: string;
    playerId: string;
    playerName: string;
    playerImageUrl: string;
    isAdmin: boolean;
}

export interface Config {
    locale: string;
    countryIsoCode: string;
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
