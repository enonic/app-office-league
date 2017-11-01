var webSocketLib = require('/lib/xp/websocket');
var eventLib = require('/lib/xp/event');
var storeLib = require('/lib/office-league-store');

var OFFICE_LEAGUE_GAME_EVENT_ID = storeLib.OFFICE_LEAGUE_GAME_EVENT_ID;
var OFFICE_LEAGUE_COMMENT_EVENT_ID = storeLib.OFFICE_LEAGUE_COMMENT_EVENT_ID;
var OFFICE_LEAGUE_JOIN_LEAGUE_EVENT_ID = storeLib.OFFICE_LEAGUE_JOIN_LEAGUE_EVENT_ID;
var GAME_PLAY_SCOPE = 'game-play';
var LIVE_GAME_SCOPE = 'live-game';
var NEW_GAME_SCOPE = 'new-game';
var LEAGUE_PROFILE_SCOPE = 'league-profile';

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
        contentType: 'application/json',
        status: 204
    }
};

exports.webSocketEvent = function (event) {
    var sessionId = event.session.id;
    var gameId = event.session.params['gameId'];
    var leagueId = event.session.params['leagueId'];
    var scope = event.session.params['scope'];
    var group = scope + '-' + gameId;
    var groupLeague = scope + '-' + leagueId;

    switch (event.type) {
    case 'open':
        if (gameId) {
            webSocketLib.addToGroup(group, sessionId);
        }
        if (leagueId) {
            webSocketLib.addToGroup(groupLeague, sessionId);
        }
        break;

    case 'message':
        break;

    case 'close':
        if (gameId) {
            webSocketLib.removeFromGroup(group, sessionId);
        }
        if (leagueId) {
            webSocketLib.removeFromGroup(groupLeague, sessionId);
        }
        break;
    }
};

eventLib.listener({
    type: 'custom.' + OFFICE_LEAGUE_GAME_EVENT_ID,
    localOnly: false,
    callback: function (event) {
        var gameId = event.data.gameId;
        var leagueId = event.data.leagueId;

        var data = JSON.stringify({gameId: gameId, leagueId: leagueId, event: 'game_update'});
        var group = LIVE_GAME_SCOPE + '-' + gameId;
        webSocketLib.sendToGroup(group, data);

        var groupLeague = LEAGUE_PROFILE_SCOPE + '-' + leagueId;
        webSocketLib.sendToGroup(groupLeague, data);
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

eventLib.listener({
    type: 'custom.' + OFFICE_LEAGUE_JOIN_LEAGUE_EVENT_ID,
    localOnly: false,
    callback: function (event) {
        var leagueId = event.data.leagueId;
        var playerId = event.data.playerId;
        var data = JSON.stringify({leagueId: leagueId, playerId: playerId, event: 'join_league'});
        var group = NEW_GAME_SCOPE + '-' + leagueId;
        webSocketLib.sendToGroup(group, data);
    }
});