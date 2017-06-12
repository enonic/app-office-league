var storeLib = require('/lib/office-league-store');

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
        storeLib.regenerateLeagueRanking(league)
    }
};
