var storeLib = require('/lib/office-league-store');
var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');

var defaultImage = ioLib.getResource('/site/controllers/default-images/account-multiple.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var teamName = req.url.substr(req.url.lastIndexOf('/') + 1);

    var team = storeLib.getTeamByName(teamName);
    if (!team) {
        return defaultImageHandler();
    }

    return attachmentLib.serveAttachment(req, storeLib.getRepoConnection(), team, team.image, defaultImageHandler);
};

var defaultImageHandler = function () {
    return {
        body: defaultImage,
        contentType: defaultImageType
    }
};