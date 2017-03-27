var graphQlLib = require('graphql');
var schemaLib = require('./graphql-schema');

exports.get = function (req) {
    var appBaseAbsoluteUrl = portalLib.pageUrl({
        path: site._path + '/app',
        type: 'absolute'
    });
    
    var user = authLib.getUser();
    var userObj = user && {key: user.key};
    if (user) {
        var player = storeLib.getPlayerByUserKey(user.key);
        userObj.playerId = player && player._id;
        userObj.playerName = (player && player.name) || user.displayName;
        userObj.playerImageUrl = player ? appBaseUrl + '/' + player.imageUrl : '';
    }
    
    var result = graphQlLib.execute(schemaLib.schema, body.query, body.variables);
    return {
        contentType: 'application/json',
        body: {
            user: userObj && JSON.stringify(userObj),
            loginUrl: portalLib.loginUrl({redirect: appBaseAbsoluteUrl}),
            logoutUrl: portalLib.logoutUrl({redirect: appBaseAbsoluteUrl})
        }
    };
};