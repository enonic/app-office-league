var storeLib = require('/lib/office-league-store');

exports.get = function (req) {
    var playerName = req.url.substr(req.url.lastIndexOf('/') + 1);
    log.info(playerName);
    var player = storeLib.getPlayerByName(playerName);
    if (!player) {
        return {
            status: 404
        }
    }

    var img = storeLib.getPlayerImageStream(player);
    if (!img) {
        return {
            status: 404
        }
    }

    return {
        contentType: player.imageType || 'image/png',
        body: img
    }
};