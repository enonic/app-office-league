var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/xp/mustache');
var authLib = require('/lib/xp/auth');
var version = (Date.now() / 1000).toFixed();

exports.get = function(req) {
    var sitePath = portalLib.getSite()._path;
    var siteUrl = portalLib.pageUrl({path: sitePath});
    var user = authLib.getUser();

    siteUrl = (siteUrl == '/') ? '' : siteUrl;
    
    var params = {
        siteUrl: siteUrl + '/',
        appUrl: siteUrl + '/app',
        assetUrl : siteUrl + '/app/assets',
        version: version,
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
