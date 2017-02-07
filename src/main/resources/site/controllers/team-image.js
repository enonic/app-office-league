var storeLib = require('/lib/office-league-store');

exports.get = function (req) {
    var teamName = req.url.substr(req.url.lastIndexOf('/') + 1);

    var team = storeLib.getTeamByName(teamName);
    if (!team) {
        return {
            status: 404
        }
    }

    var img = storeLib.getTeamImageStream(team);
    if (!img) {
        return {
            status: 404
        }
    }

    return {
        contentType: team.imageType || 'image/png',
        body: img
    }
};