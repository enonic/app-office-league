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
    }

    var params = {
        locale: req.params.locale || 'en',
        user: userObj && JSON.stringify(userObj),
        isLive: (req.mode == 'live'),
        siteUrl: baseHref,
        baseHref: appBaseUrl + '/',   // trailing slash for relative urls to be correct
        assetsUrl: portalLib.assetUrl({path: ""}),
        loginUrl: portalLib.loginUrl({redirect: appBaseUrl}),
        logoutUrl: portalLib.logoutUrl({redirect: appBaseUrl}),
        idProvider: portalLib.idProviderUrl(),
        setImageUrl: portalLib.serviceUrl({service: "set-image"})
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