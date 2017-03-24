var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/xp/mustache');
var authLib = require('/lib/xp/auth');

exports.get = function(req) {
    var sitePath = portalLib.getSite()._path;
    var siteUrl = portalLib.pageUrl({path: sitePath});
    var user = authLib.getUser();
    var params = {
        siteUrl: (siteUrl == '/') ? '/' : siteUrl + '/',
        appUrl: (siteUrl == '/') ? '/app' : siteUrl + '/app',
        assetUrl : portalLib.assetUrl(''),
        appVersion: app.version,
        userKey: user ? user.key : ''
    };

    var res = mustache.render(resolve('service-worker.js'), params);

    return {
        body: res,
        contentType: 'application/javascript',
        headers: {
            'Service-Worker-Allowed': (siteUrl == '/' ? '' : siteUrl)
        }
    };
};
