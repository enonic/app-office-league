var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var mustacheLib = require('/lib/xp/mustache');
var storeLib = require('/lib/office-league-store');
var view = resolve('pwa.html');

exports.get = function (req) {
    var site = portalLib.getSite();
    var baseHref = portalLib.pageUrl({
        path: site._path
    });
    var appBaseUrl = portalLib.pageUrl({
        path: site._path + '/app'
    });
    var appBaseAbsoluteUrl = portalLib.pageUrl({
        path: site._path + '/app',
        type: 'absolute'
    });

    if (loggedInUserWithoutPlayer()) {
        var createPlayerPath = appBaseUrl + '/player-create';
        if (!endsWith(req.path, createPlayerPath)) {
            return {
                redirect: appBaseUrl + '/player-create'
            }
        }
    }

    var user = authLib.getUser();
    var userObj = user && {key: user.key};
    if (user) {
        var player = storeLib.getPlayerByUserKey(user.key);
        userObj.playerId = player && player._id;
        userObj.playerName = (player && player.name) || user.displayName;
        userObj.playerImageUrl = player ? appBaseUrl + '/' + player.imageUrl : '';
    }

    var params = {
        locale: req.params.locale || 'en',
        user: userObj && JSON.stringify(userObj),
        isLive: (req.mode === 'live'),
        siteUrl: (baseHref === '/') ? '' : baseHref,
        baseHref: appBaseUrl + '/',   // trailing slash for relative urls to be correct
        assetsUrl: portalLib.assetUrl({path: ""}),
        loginUrl: portalLib.loginUrl({redirect: appBaseAbsoluteUrl}),
        logoutUrl: portalLib.logoutUrl({redirect: appBaseAbsoluteUrl}),
        idProvider: portalLib.idProviderUrl(),
        setImageUrl: portalLib.serviceUrl({service: "set-image"}),
        liveGameUrl: getWebSocketUrl(portalLib.serviceUrl({service: "live-game", type: "absolute"}))
    };
    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};

var loggedInUserWithoutPlayer = function () {
    var user = authLib.getUser();
    if (!user) {
        return false;
    }

    var player = storeLib.getPlayerByUserKey(user.key);
    return !player;
};

var endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getWebSocketUrl = function (url) {
    var wsProto = url.indexOf('https:') === 0 ? 'wss' : 'ws';
    return wsProto + url.substring(url.indexOf(':'));
};