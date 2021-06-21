var imageLib = require("/lib/image");
var contextLib = require("/lib/xp/context");
const util = require("/lib/util");

exports.processImage = function (node, attachment, params) {
    if (!isProcessableImage(attachment.mimeType)) {
        return null;
    }

    var size = params.size || 128;
    return contextLib.run(
        {
            repository: "office-league",
            branch: "master",
        },
        function () {
            return imageLib.processImage({
                id: node._id,
                name: attachment.binary,
                scale: "square(" + size + ")",
                background: "ffffff",
                mimeType: attachment.mimeType,
                orientation: attachment.orientation,
            });
        }
    );
};

var isProcessableImage = function (mimeType) {
    switch (mimeType) {
        case "image/png":
        case "image/gif":
        case "image/jpeg":
        case "image/pjpeg":
        case "image/tiff":
        case "image/bmp":
        case "image/x-bmp":
        case "image/webp":
            return true;
    }
    return false;
};

exports.isValidImage = function (imageStream, mimeType) {
    return (
        mimeType.indexOf("image/svg+xml") === 0 ||
        imageLib.isValidImage(imageStream)
    );
};
