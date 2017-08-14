var attachmentLib = require('/lib/attachment');
var ioLib = require('/lib/xp/io');
var userProfileLib = require('/lib/user-profile');

var defaultImage = ioLib.getResource('/site/controllers/default-images/account.svg').getStream();
var defaultImageType = 'image/svg+xml';

exports.get = function (req) {
    var pathParts = req.path.split('/');
    var userKey = decodeURIComponent(pathParts[pathParts.length - 1]);

    var image = userProfileLib.getUserProfileImage(userKey);
    if (!image) {
        return defaultImageHandler();
    }

    return {
        body: image.body,
        contentType: image.contentType
    }
};

var defaultImageHandler = function () {
    return {
        body: defaultImage,
        contentType: defaultImageType,
        headers: attachmentLib.setCacheForever({})
    }
};
