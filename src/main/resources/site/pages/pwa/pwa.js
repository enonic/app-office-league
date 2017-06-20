var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var mustacheLib = require('/lib/xp/mustache');
var storeLib = require('/lib/office-league-store');
var invitationLib = require('/lib/invitation');
var geoipLib = require('/lib/enonic/geoip');
var view = resolve('pwa.html');

exports.get = function (req) {
    var site = portalLib.getSite();
    var baseHref = portalLib.pageUrl({
        path: site._path
    });
    var baseAbsoluteUrl = portalLib.pageUrl({
        path: site._path,
        type: 'absolute'
    });
    var appBaseUrl = portalLib.pageUrl({
        path: site._path + '/app'
    });
    var appBaseAbsoluteUrl = portalLib.pageUrl({
        path: site._path + '/app',
        type: 'absolute'
    });


    if (mustLogIn(req)) {
        return {
            redirect: portalLib.loginUrl({
                type: 'absolute',
                redirect: req.url
            })
        }
    }

    var user = authLib.getUser();
    if (!user && hasLoginSuggestParam(req)) {
        return {
            redirect: portalLib.loginUrl({
                type: 'absolute',
                redirect: req.url
            })
        }
    }

    if (isPlayerCreatePage(req, appBaseUrl)) {
        if (req.params.invitation) {
            var player = getPlayer();
            if (player) {
                var invitation = invitationLib.removeInvitationByToken(req.params.invitation);
                if (invitation) {
                    storeLib.joinPlayerLeague(invitation.leagueId, player._id);
                    storeLib.refresh();
                }
            }

        }
    } else {
        if (isLoggedInUserWithoutPlayer()) {
            return {
                redirect: appBaseUrl + '/player-create'
            }
        }
    }


    var userObj = user && {key: user.key};
    if (user) {
        var player = storeLib.getPlayerByUserKey(user.key);
        userObj.playerId = player && player._id;
        userObj.playerName = (player && player.name) || user.displayName;
        userObj.playerImageUrl = player ? appBaseUrl + player.imageUrl : '';
        userObj.isAdmin = authLib.hasRole('system.admin');
    }

    var countryIsoCode;
    if (req.remoteAddress) {
        var locationData = geoipLib.getLocationData(req.remoteAddress);
        countryIsoCode = geoipLib.countryISO(locationData);
    }
    countryIsoCode = countryIsoCode || 'no';

    var params = {
        locale: req.params.locale || 'en',
        countryIsoCode: countryIsoCode,
        user: userObj && JSON.stringify(userObj),
        isLive: (req.mode === 'live'),
        siteUrl: (baseHref === '/') ? '' : baseHref,
        baseHref: appBaseUrl + '/',   // trailing slash for relative urls to be correct
        assetsUrl: appBaseUrl + '/assets',
        audioUrl: appBaseUrl + '/assets/audio/',
        loginUrl: portalLib.loginUrl({redirect: appBaseAbsoluteUrl}),
        logoutUrl: portalLib.logoutUrl({redirect: appBaseAbsoluteUrl}),
        logoutMarketingUrl: portalLib.logoutUrl({redirect: baseAbsoluteUrl}),
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

var isPlayerCreatePage = function (req, appBaseUrl) {
    return endsWith(req.path, appBaseUrl + '/player-create');
};

var mustLogIn = function (req) {
    return !authLib.getUser() && (req.path.search(/\/app$/) !== -1 || req.path.search(/\/app\/player-create$/) !== -1);
};

var hasLoginSuggestParam = function (req) {
    return req.params.login;
};

var getPlayer = function () {
    var user = authLib.getUser();
    return user && storeLib.getPlayerByUserKey(user.key);
};

var isLoggedInUserWithoutPlayer = function () {
    var user = authLib.getUser();
    if (!user) {
        return false;
    }
    return !storeLib.getPlayerByUserKey(user.key);
};

var endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getWebSocketUrl = function (url) {
    var wsProto = url.indexOf('https:') === 0 ? 'wss' : 'ws';
    return wsProto + url.substring(url.indexOf(':'));
};