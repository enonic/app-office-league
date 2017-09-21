var storeLib = require('/lib/office-league-store');
var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');
var imageHelper = require('./image-helper');

var defaultImage = ioLib.getResource('/site/controllers/default-images/league.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var pathParts = req.path.split('/');
    var leagueName = decodeURIComponent(pathParts[pathParts.length - 1]);

    var league = storeLib.getLeagueByName(leagueName);
    if (!league || req.path.endsWith('/-/default')) {
        return defaultImageHandler();
    }

    try {
        return attachmentLib.serveAttachment(req, storeLib.getRepoConnection(), league, league.image, defaultImageHandler,
            imageHelper.processImage);
    } catch (e) {
        log.warning('Unable to process league image ("' + leagueName + '"): ' + e);
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