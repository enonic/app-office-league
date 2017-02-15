var storeLib = require('/lib/office-league-store');
var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');

var defaultImage = ioLib.getResource('/site/controllers/default-images/8-tournament-transitive.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var leagueName = req.url.substr(req.url.lastIndexOf('/') + 1);

    var league = storeLib.getLeagueByName(leagueName);
    if (!league) {
        return defaultImageHandler();
    }

    return attachmentLib.serveAttachment(req, storeLib.getRepoConnection(), league, league.image, defaultImageHandler);
};

var defaultImageHandler = function () {
    return {
        body: defaultImage,
        contentType: defaultImageType
    }
};