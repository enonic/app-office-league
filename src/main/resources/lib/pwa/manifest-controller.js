var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/mustache');

exports.get = function(req) {
    var startUrl = portalLib.url({ path: "/", type: "absolute" });

    var params = {
        startUrl,
        iconUrl : portalLib.assetUrl({path: '/icons'})
    };
    var res = mustache.render(resolve('manifest.json'), params);
    
    return {
        body: res,
        contentType: 'application/json'
    };
};
