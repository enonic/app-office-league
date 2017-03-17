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
    var user = authLib.getUser();

    var playerCreationUrl = baseHref + '/app/player-create';
    if (user && !storeLib.getPlayerByUserKey(user.key) && playerCreationUrl !== req.path) {
        return {
            redirect: playerCreationUrl
            
            
            
        }
    }

    var params = {
        locale: req.params.locale || 'en',
        user: user && JSON.stringify(createUserConfig(user)),
        siteUrl: baseHref + '/',
        isLive: (req.mode == 'live'),
        baseHref: baseHref + '/app/',   // trailing slash for relative urls to be correct
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

function createUserConfig(user) {
    if (user) {
        var player = storeLib.getPlayerByUserKey(user.key);
        return {
            key: user.key,
            displayName: user.displayName,
            playerId: player && player._id,
            playerName: player && player.name
        };
    }
    return undefined;
}
