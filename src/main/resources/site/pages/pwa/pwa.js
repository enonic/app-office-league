var portalLib = require('/lib/xp/portal');
var mustacheLib = require('/lib/xp/mustache');
var view = resolve('pwa.html');

exports.get = function (req) {

    var content = portalLib.getContent();

    log.debug('Got content: ' + JSON.stringify(content));

    var assetsUrl = portalLib.assetUrl({path: ""});
    var baseHref = portalLib.pageUrl({
        path: content.path
    });

    var params = {
        baseHref: baseHref,
        assetsUrl: assetsUrl
    };
    var body = mustacheLib.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
