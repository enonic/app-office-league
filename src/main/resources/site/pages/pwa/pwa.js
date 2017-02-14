var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var mustacheLib = require('/lib/xp/mustache');
var view = resolve('pwa.html');

exports.get = function (req) {

    var content = portalLib.getContent();
    var baseHref = portalLib.pageUrl({
        path: content.path
    });
    var user = authLib.getUser();

    var params = {
        user: JSON.stringify(user),
        baseHref: baseHref,
        assetsUrl: portalLib.assetUrl({path: ""}),
        loginUrl: portalLib.loginUrl(),
        logoutUrl: portalLib.logoutUrl(),
        idProvider: portalLib.idProviderUrl()
    };
    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
