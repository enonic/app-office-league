var storeLib = require('/lib/office-league-store');
var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');
var imageHelper = require('./image-helper');

var defaultImage = ioLib.getResource('/site/controllers/default-images/account.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var pathParts = req.path.split('/');
    var playerName = decodeURIComponent(pathParts[pathParts.length - 1]);

    var player = storeLib.getPlayerByName(playerName);
    if (!player || req.path.endsWith('/-/default')) {
        return defaultImageHandler();
    }
    try {
        return attachmentLib.serveAttachment(req, storeLib.getRepoConnection(), player, player.image, defaultImageHandler,
            imageHelper.processImage);
    } catch (e) {
        log.warning('Unable to process player image ("' + playerName + '"): ' + e);
        return defaultImageHandler();
    }
};

var defaultImageHandler = function () {
    return {
        body: defaultImage,
        contentType: defaultImageType,
        headers: attachmentLib.setCacheForever({})
    }
};