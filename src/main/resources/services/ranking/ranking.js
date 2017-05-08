var storeLib = require('/lib/office-league-store');
var ratingLib = require('/lib/office-league-rating');

exports.get = function (req) {
    var leagueName = req.params['league'];
    var leagues = [];
    if (leagueName) {
        leagues = [storeLib.getLeagueByName(leagueName)];
    } else {
        leagues = storeLib.getLeagues(0, -1).hits;
    }

    exports.updateLeagues(leagues);

    return {
        contentType: 'application/json',
        body: {
            success: true
        }
    }
};

exports.updateLeagues = function (leagues) {
    var league;
    for (var l = 0; l < leagues.length; l++) {
        league = leagues[l];
        log.info('Updating ranking for league [' + league.name + ']');
        updateLeague(league);
    }
};

var updateLeague = function (league) {
    log.info('Reset players ratings');
    resetPlayerRatings(league);
    log.info('Reset teams ratings');
    resetTeamRatings(league);
    storeLib.refresh();

    var start = 0, gamesResp, games, game, i;
    gamesResp = storeLib.getGamesByLeagueId(league._id, 0, 0);
    var total = gamesResp.total;
    log.info('Calculate games ratings. ' + total + ' games in the league.');

    do {
        gamesResp = storeLib.getGamesByLeagueId(league._id, start, 10, null, 'time ASC');
        games = gamesResp.hits;
        for (i = 0; i < games.length; i++) {
            game = games[i];
            storeLib.updateGameRanking(game);
            storeLib.refresh();
            game = storeLib.getGameById(game._id);
            storeLib.logGameRanking(game);
        }

        start += gamesResp.count;
        log.info('Calculating game ratings [' + start + ' / ' + total + '] games in the league.');

    } while (gamesResp.count > 0);
};

var resetPlayerRatings = function (league) {
    var start = 0, leaguePlayerResp, leaguePlayers, leaguePlayer, i;
    do {
        leaguePlayerResp = storeLib.getLeaguePlayersByLeagueId(league._id, start, 10, 'name ASC');
        leaguePlayers = leaguePlayerResp.hits;
        for (i = 0; i < leaguePlayers.length; i++) {
            leaguePlayer = leaguePlayers[i];
            storeLib.setPlayerLeagueRating(leaguePlayer.leagueId, leaguePlayer.playerId, ratingLib.INITIAL_RATING);
            var p = storeLib.getPlayerById(leaguePlayer.playerId);
            var lp = storeLib.getLeaguePlayerByLeagueIdAndPlayerId(leaguePlayer.leagueId, leaguePlayer.playerId);
            log.info('Reset player ' + p.name + ': new rating=' + lp.rating);
        }

        start += leaguePlayerResp.count;
    } while (leaguePlayerResp.count === 10);
};

var resetTeamRatings = function (league) {
    var start = 0, leagueTeamResp, leagueTeams, leagueTeam, i;
    do {
        leagueTeamResp = storeLib.getLeagueTeamsByLeagueId(league._id, start, 10, 'name ASC');
        leagueTeams = leagueTeamResp.hits;
        for (i = 0; i < leagueTeams.length; i++) {
            leagueTeam = leagueTeams[i];
            storeLib.setTeamLeagueRating(leagueTeam.leagueId, leagueTeam.teamId, ratingLib.INITIAL_RATING);
            var t = storeLib.getTeamById(leagueTeam.teamId);
            var lt = storeLib.getLeagueTeamByLeagueIdAndTeamId(leagueTeam.leagueId, leagueTeam.teamId);
            log.info('Reset team ' + t.name + ': new rating=' + lt.rating);
        }

        start += leagueTeamResp.count;
    } while (leagueTeamResp.count === 10);
};
