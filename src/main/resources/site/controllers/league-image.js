var storeLib = require('/lib/office-league-store');
var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');
var imageHelper = require('./image-helper');

var defaultImage = ioLib.getResource('/site/controllers/default-images/league.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var leagueName = req.path.substr(req.path.lastIndexOf('/') + 1);

    var league = storeLib.getLeagueByName(leagueName);
    if (!league) {
        return defaultImageHandler();
    }

    return attachmentLib.serveAttachment(req, storeLib.getRepoConnection(), league, league.image, defaultImageHandler, imageHelper.processImage);
};

var defaultImageHandler = function () {
    return {
        body: defaultImage,
        contentType: defaultImageType
    }
};