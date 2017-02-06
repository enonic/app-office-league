var storeLib = require('/lib/office-league-store');

exports.get = function (req) {

    return {
        contentType: 'application/json',
        body: {
            leagues: storeLib.getLeagues(),
            leagueById: storeLib.getLeagueById('db0af7db-6a11-4242-b124-63467e58449c'),
            leagueByName: storeLib.getLeagueByName('Enonic Foos'),
            players: storeLib.getPlayers(0, 10),
            playerById: storeLib.getPlayerById('341a3117-fda7-4ef3-8827-592b819121f7'),
            playerByName: storeLib.getPlayerByName('aro')
        }
    }
};