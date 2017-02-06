var portalLib = require('/lib/xp/portal');
var mustacheLib = require('/lib/xp/mustache');

exports.get = function () {
    var view = resolve('./graphiql.html');
    var assetsUrl = portalLib.assetUrl({path: ""});
    var params = {
        assetsUrl: assetsUrl,
        officeGraphQlUrl: portalLib.serviceUrl({service: "graphql"})
    };

    return {
        body: mustacheLib.render(view, params)
    };
};
