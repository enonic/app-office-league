export interface ConfigUser {
    key: string;
    playerId: string;
    playerName: string;
    playerImageUrl: string;
    isAdmin: boolean;
}

export interface Content {
    name: string;
    type: string;
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
    user: ConfigUser;
    content: Content;
    publicKey: string;
}

declare var XPCONFIG: Config;

export {XPCONFIG};
