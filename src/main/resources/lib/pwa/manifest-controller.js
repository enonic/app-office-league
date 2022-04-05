var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/mustache');

exports.get = function(req) {

    var bean = __.newBean('com.enonic.app.officeleague.VhostHandler');
    const vhost = bean.getVirtualHost();

    var startUrl = vhost + "/app";

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
