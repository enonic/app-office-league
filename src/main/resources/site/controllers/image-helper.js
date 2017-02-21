var imageLib = require('/lib/image');
var contextLib = require('/lib/xp/context');

exports.processImage = function (node, attachment) {
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