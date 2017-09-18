var storeLib = require('/lib/office-league-store');

exports.get = function (req) {
    var start = 0, gamesResp, games, game, i;
    gamesResp = storeLib.getGames(0, 0);
    var total = gamesResp.total;games
    log.info('Processing games (' + total + ')');

    do {
        gamesResp = storeLib.getGames(start, 10);
        games = gamesResp.hits;
        for (i = 0; i < games.length; i++) {
            game = games[i];
            var gameTeams = game.gameTeams || [];
            for (var t = 0; t < gameTeams.length; t++) {
                log.info('joinTeamLeague ' + game.leagueId + ' -> ' + gameTeams[t].teamId);
                storeLib.joinTeamLeague(game.leagueId, gameTeams[t].teamId);
            }
        }

        start += gamesResp.count;
        log.info('Processing games [' + start + ' / ' + total + ']');

    } while (gamesResp.count > 0);

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            message: 'Ok'
        }
    }
};
