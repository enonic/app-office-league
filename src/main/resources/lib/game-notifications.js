var eventLib = require('/lib/xp/event');
var storeLib = require('office-league-store');
var authLib = require('/lib/xp/auth');

var OFFICE_LEAGUE_GAME_EVENT_ID = storeLib.OFFICE_LEAGUE_GAME_EVENT_ID;

exports.setupPushNotifications = function () {
    eventLib.listener({
        type: 'custom.' + OFFICE_LEAGUE_GAME_EVENT_ID,
        localOnly: true,
        callback: function (event) {
            var gameId = event.data.gameId;
            var leagueId = event.data.leagueId;

            sendGameNotifications(gameId, leagueId);
        }
    });
};

var sendGameNotifications = function (gameId, leagueId) {
    storeLib.refresh();
    var game = storeLib.getGameById(gameId);
    if (!game) {
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        return;
    }

    var playerIds = storeLib.getLeaguePlayersByLeagueId(leagueId, 0, -1).hits.map(function (lp) {
        return lp.playerId;
    });
    log.info('League player Ids: ' + playerIds.join(','));

    var baseUrl = app.config['officeleague.baseUrl'] || 'http://localhost:8080/portal/draft/office-league/app';
    var url = baseUrl + '/games/' + game._id;

    var points = [].concat(game.points || []);
    // if (game.finished) {
    //     log.info('Sending push notifications for ended game: ' + gameId);
    //
    //     storeLib.sendPushNotification({
    //         playerIds: playerIds,
    //         text: "A game has ended in '" + league.name + "'",
    //         url: url
    //     });
    //
    // } else
    if (points.length === 0) {
        log.info('Sending push notifications for new game: ' + gameId);

        storeLib.sendPushNotification({
            playerIds: playerIds,
            text: "A game has started in '" + league.name + "'",
            url: url
        });

    }
};

var excludeCurrentPlayer = function (playerIds) {
    var currentPlayerId = getCurrentPlayerId();
    log.info('currentPlayerId: ' + currentPlayerId);
    if (!currentPlayerId) {
        return playerIds;
    }
    return playerIds.filter(function (pid) {
        return pid !== currentPlayerId;
    });
};

var getCurrentPlayerId = function () {
    var user = authLib.getUser();
    log.info('user: ' + JSON.stringify(user, null, 2));
    if (!user) {
        return null;
    }
    var player = storeLib.getPlayerByUserKey(user.key);
    return player && player._id;
};