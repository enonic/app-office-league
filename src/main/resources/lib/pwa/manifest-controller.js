var assetLib = require('/lib/enonic/asset');
var mustache = require('/lib/mustache');

exports.get = function(req) {

    const startUrl = "./";

    var params = {
        startUrl,
        iconUrl : assetLib.assetUrl({path: '/icons'})
    };
    var res = mustache.render(resolve('manifest.json'), params);

    return {
        body: res,
        contentType: 'application/json'
    };
};
