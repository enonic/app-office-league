var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var mustacheLib = require('/lib/xp/mustache');
var storeLib = require('/lib/office-league-store');
var view = resolve('pwa.html');

exports.get = function (req) {

    var content = portalLib.getContent();
    var baseHref = portalLib.pageUrl({
        path: content.path
    });
    var user = authLib.getUser();
    var userObj = user && {
            key: user.key,
            displayName: user.displayName
        };
    if (user) {
        var player = storeLib.getPlayerByUserKey(user.key);
        userObj.playerId = player && player._id;
        userObj.playerName = player && player.name;
    }

    var params = {
        locale: req.params.locale || 'en',
        user: userObj && JSON.stringify(userObj),
        baseHref: baseHref + '/',   // trailing slash for relative urls to be correct
        assetsUrl: portalLib.assetUrl({path: ""}),
        loginUrl: portalLib.loginUrl({redirect: baseHref}),
        logoutUrl: portalLib.logoutUrl({redirect: baseHref}),
        idProvider: portalLib.idProviderUrl(),
        setImageUrl: portalLib.serviceUrl({service: "set-image"})
    };
    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
