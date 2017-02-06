var storeLib = require('/lib/office-league-store');

exports.get = function (req) {

    return {
        contentType: 'application/json',
        body: {
            game: storeLib.getGameById('e97d933c-cf49-4482-8c64-1e28eecff61a'),
            leagues: storeLib.getLeagues(),
            leagueById: storeLib.getLeagueById('db0af7db-6a11-4242-b124-63467e58449c'),
            leagueByName: storeLib.getLeagueByName('Enonic Foos'),
            players: storeLib.getPlayers(0, 10),
            playerById: storeLib.getPlayerById('341a3117-fda7-4ef3-8827-592b819121f7'),
            playerByName: storeLib.getPlayerByName('aro'),
            teams: storeLib.getTeams(0, 10),
            teamById: storeLib.getTeamById('cf672365-4f1b-486c-a5c8-08ec05019b9e'),
            teamByName: storeLib.getTeamByName('Crawling sombreros'),

            leaguePlayers: storeLib.getLeaguePlayers('db0af7db-6a11-4242-b124-63467e58449c'),
            leagueTeams: storeLib.getLeagueTeams('db0af7db-6a11-4242-b124-63467e58449c'),
            leagueGames: storeLib.getLeagueGames(storeLib.getLeagueByName('Enonic Foos')._id)
        }
    }
};