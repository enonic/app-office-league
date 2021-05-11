var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/mustache');

exports.get = function(req) {
    var sitePath = portalLib.getSite()._path;
    var siteUrl = portalLib.pageUrl({path: sitePath});
    var params = {
        siteUrl: (siteUrl == '/') ? '/' : siteUrl + '/',
        iconUrl : portalLib.assetUrl({path: '/icons'})
    };
    var res = mustache.render(resolve('manifest.json'), params);
    
    return {
        body: res,
        contentType: 'application/json'
    };
};
