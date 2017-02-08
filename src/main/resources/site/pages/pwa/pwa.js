var portalLib = require('/lib/xp/portal');
var mustacheLib = require('/lib/xp/mustache');
var view = resolve('pwa.html');

exports.get = function (req) {

    var assetsUrl = portalLib.assetUrl({path: ""});

    var params = {
        assetsUrl: assetsUrl
    };
    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
