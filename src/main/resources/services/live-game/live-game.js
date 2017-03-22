var webSocketLib = require('/lib/xp/websocket');
var eventLib = require('/lib/xp/event');

var OFFICE_LEAGUE_GAME_EVENT_ID = 'office-league-game';

exports.get = function (req) {
    if (req.webSocket) {
        return {
            webSocket: {
                data: {},
                subProtocols: ['office-league']
            }
        };
    }

    return {
        status: 204
    }
};

exports.webSocketEvent = function (event) {
    var sessionId = event.session.id;
    var gameId = event.session.params['gameId'];
    switch (event.type) {
    case 'open':
        if (gameId) {
            webSocketLib.addToGroup(gameId, sessionId);
        }
        break;

    case 'message':
        break;

    case 'close':
        if (gameId) {
            webSocketLib.removeFromGroup(gameId, sessionId);
        }
        break;
    }
};

eventLib.listener({
    type: 'custom.' + OFFICE_LEAGUE_GAME_EVENT_ID,
    localOnly: false,
    callback: function (event) {
        var gameId = event.data.gameId;
        var data = JSON.stringify({gameId: gameId});
        webSocketLib.sendToGroup(gameId, data);
    }
});