var portalLib = require('/lib/xp/portal');
var mustache = require('/lib/mustache');
var authLib = require('/lib/xp/auth');
var version = (Date.now() / 1000).toFixed();

exports.get = function (req) {
    var user = authLib.getUser();

    var params = {
        appUrl: '',
        assetUrl: '/assets',
        version: version,
        userKey: user ? user.key : ''
    };

    var res = mustache.render(resolve('service-worker.js'), params);

    return {
        body: res,
        contentType: 'application/javascript'
    };
};
