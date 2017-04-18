var webSocketLib = require('/lib/xp/websocket');
var eventLib = require('/lib/xp/event');
var storeLib = require('/lib/office-league-store');

var OFFICE_LEAGUE_GAME_EVENT_ID = storeLib.OFFICE_LEAGUE_GAME_EVENT_ID;
var OFFICE_LEAGUE_COMMENT_EVENT_ID = storeLib.OFFICE_LEAGUE_COMMENT_EVENT_ID;
var GAME_PLAY_SCOPE = 'game-play';
var LIVE_GAME_SCOPE = 'live-game';

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
    log.info(JSON.stringify(event));
    var sessionId = event.session.id;
    var gameId = event.session.params['gameId'];
    var scope = event.session.params['scope'];
    var group = scope + '-' + gameId;

    switch (event.type) {
    case 'open':
        if (gameId) {
            webSocketLib.addToGroup(group, sessionId);
        }
        break;

    case 'message':
        break;

    case 'close':
        if (gameId) {
            webSocketLib.removeFromGroup(group, sessionId);
        }
        break;
    }
};

eventLib.listener({
    type: 'custom.' + OFFICE_LEAGUE_GAME_EVENT_ID,
    localOnly: false,
    callback: function (event) {
        var gameId = event.data.gameId;
        var data = JSON.stringify({gameId: gameId, event: 'game_update'});
        var group = LIVE_GAME_SCOPE + '-' + gameId;
        webSocketLib.sendToGroup(group, data);
    }
});

eventLib.listener({
    type: 'custom.' + OFFICE_LEAGUE_COMMENT_EVENT_ID,
    localOnly: false,
    callback: function (event) {
        var gameId = event.data.gameId;
        var commentId = event.data.commentId;
        storeLib.refresh();
        var comment = storeLib.getCommentById(commentId);
        if (!comment) {
            return;
        }

        var data = JSON.stringify({gameId: gameId, event: 'game_comment'});
        var liveGameGroup = LIVE_GAME_SCOPE + '-' + gameId;
        webSocketLib.sendToGroup(liveGameGroup, data);

        var player = storeLib.getPlayerById(comment.author);
        var commentEvent = {
            gameId: gameId, event: 'game_comment',
            data: {
                message: comment.text,
                player: {
                    id: player._id,
                    name: player.name,
                    imageUrl: player.imageUrl
                }
            }
        };
        data = JSON.stringify(commentEvent);

        var gamePlayGroup = GAME_PLAY_SCOPE + '-' + gameId;
        webSocketLib.sendToGroup(gamePlayGroup, data);
    }
});