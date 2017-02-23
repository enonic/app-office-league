var imageLib = require('/lib/image');
var contextLib = require('/lib/xp/context');

exports.processImage = function (node, attachment) {
    if (!isProcessableImage(attachment.mimeType)) {
        return null;
    }

    return contextLib.run({
        repository: 'office-league',
        branch: 'master'

    }, function () {
        return imageLib.processImage({
            id: node._id,
            name: attachment.binary,
            scale: 'square(42)',
            mimeType: attachment.mimeType
        })
    });
};

var isProcessableImage = function (mimeType) {
    return mimeType.indexOf('image/png') === 0 ||
           mimeType.indexOf('image/gif') === 0 ||
           mimeType.indexOf('image/jpeg') === 0 ||
           mimeType.indexOf('image/pjpeg') === 0 ||
           mimeType.indexOf('image/tiff') === 0 ||
           mimeType.indexOf('image/bmp') === 0 ||
           mimeType.indexOf('image/x-bmp') === 0
};
