export interface Config {
    locale: string;
    baseHref: string;
    idProvider: string;
    assetsUrl: string;
    graphQlUrl: string;
    sessionUrl: string;
    setImageUrl: string;
    liveGameUrl: string;
}

declare var XPCONFIG: Config;

export {XPCONFIG};
