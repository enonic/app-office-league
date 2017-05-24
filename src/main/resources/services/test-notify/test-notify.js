var storeLib = require('/lib/office-league-store');
var pushLib = require('/lib/push');

exports.get = function () {
    storeLib.forEachPushSubscription(function (pushSubscription) {
        pushLib.send(pushSubscription.endpoint, pushSubscription.key, pushSubscription.auth);
    });
};
