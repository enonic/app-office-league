var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/xp/context');
var notifications = require('/lib/notifications');

var REPO_NAME = 'office-league';
var PUSH_SUBSCRIPTIONS_PATH = '/push-subscriptions';

exports.getKeyPair = function () {

    var keyPair = sudo(function () {
        return loadKeyPair();
    });
    if (!keyPair) {
        keyPair = notifications.generateKeyPair();
        sudo(function () {
            storeKeyPair(keyPair);
        });
    }

    return keyPair;
};

exports.sendPushNotification = function (endpoint, auth, p256dh, message) {
    var keyPair = exports.getKeyPair();
    var status = notifications.send({
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        endpoint: endpoint,
        auth: auth,
        receiverKey: p256dh,
        payload: message
    });
    return status >= 200 && status < 300;
};


var sudo = function (func) {
    return contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, func);
};

var loadKeyPair = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });
    var pushSubNode = repoConn.get(PUSH_SUBSCRIPTIONS_PATH);
    if (pushSubNode) {
        return pushSubNode.keyPair;
    } else {
        return null;
    }
};

var storeKeyPair = function (keyPair) {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });
    repoConn.modify({
        key: PUSH_SUBSCRIPTIONS_PATH,
        editor: function (node) {
            node.keyPair = {
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey
            };
            return node;
        }
    });
};