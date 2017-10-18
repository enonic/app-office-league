var eventLib = require('/lib/xp/event');
var storeLib = require('office-league-store');

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
    var game = storeLib.getGameById(gameId);
    if (!game) {
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        return;
    }

    var playerIds = game.gamePlayers.map(function (gp) {
        return gp.playerId;
    });

    var baseUrl = app.config['officeleague.baseUrl'] || 'http://localhost:8080/portal/draft/office-league/app';
    var url = baseUrl + '/games/' + game._id;

    var points = [].concat(game.points || []);
    if (game.finished) {
        log.info('Sending push notifications for ended game: ' + JSON.stringify(game, null, 2));

        storeLib.sendPushNotification({
            playerIds: playerIds,
            text: "A game has ended in '" + league.name + "'",
            url: url
        });

    } else if (points.length === 0) {
        log.info('Sending push notifications for new game: ' + JSON.stringify(game, null, 2));

        storeLib.sendPushNotification({
            playerIds: playerIds,
            text: "A game has started in '" + league.name + "'",
            url: url
        });

    }
};
