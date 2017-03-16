var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/xp/mustache');

exports.get = function(req) {
    var sitePath = portalLib.getSite()._path;
    var siteUrl = portalLib.pageUrl({path: sitePath});
    var params = {
        siteUrl: siteUrl,
        appUrl: siteUrl + '/app',
        assetUrl : portalLib.assetUrl(''),
        appVersion: app.version
    };

    var res = mustache.render(resolve('service-worker.js'), params);

    return {
        body: res,
        contentType: 'application/javascript',
        headers: {
            'Service-Worker-Allowed': params.siteUrl
        }
    };
};
