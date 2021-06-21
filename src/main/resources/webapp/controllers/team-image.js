var storeLib = require('/lib/office-league-store');
var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');
var imageHelper = require('./image-helper');

var defaultImage = ioLib.getResource('/assets/img/default-images/account-multiple.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var pathParts = req.path.split('/');
    var teamName = decodeURIComponent(pathParts[pathParts.length - 1]);

    var team = storeLib.getTeamByName(teamName);
    if (!team || req.path.endsWith('/-/default')) {
        return defaultImageHandler();
    }

    try {
        return attachmentLib.serveAttachment(req, storeLib.getRepoConnection(), team, team.image, defaultImageHandler,
            imageHelper.processImage);
    } catch (e) {
        log.warning('Unable to process team image ("' + teamName + '"): ' + e);
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