var imageLib = require('/lib/image');
var contextLib = require('/lib/xp/context');

exports.processImage = function (node, attachment, params) {
    if (!isProcessableImage(attachment.mimeType)) {
        return null;
    }

    var size = params.size || 42;
    return contextLib.run({
        repository: 'office-league',
        branch: 'master'

    }, function () {
        return imageLib.processImage({
            id: node._id,
            name: attachment.binary,
            scale: 'square(' + size + ')',
            background: 'ffffff',
            mimeType: attachment.mimeType,
            orientation: attachment.orientation
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
