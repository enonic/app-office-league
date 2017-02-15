var storeLib = require('/lib/office-league-store');

exports.get = function (req) {
    var leagueName = req.url.substr(req.url.lastIndexOf('/') + 1);

    var league = storeLib.getLeagueByName(leagueName);

    if (!league) {
        return {
            status: 404
        }
    }

    var img = storeLib.getLeagueImageStream(league);
    if (!img) {
        return {
            status: 404
        }
    }

    return {
        contentType: league.imageType || 'image/png',
        body: img
    }
};