const storeLib = require("/lib/office-league-store");
const attachmentLib = require("/lib/attachment");
const ioLib = require("/lib/xp/io");
const imageHelper = require("./image-helper");
const util = require("/lib/util");

const defaultImage = ioLib
    .getResource("/site/controllers/default-images/account.svg")
    .getStream();
const defaultImageType = "image/svg+xml";

exports.get = function (req) {
    let pathParts = req.path.split("/");
    let playerName = decodeURIComponent(pathParts[pathParts.length - 1]);

    let player = storeLib.getPlayerByName(playerName);
    if (!player || req.path.endsWith("/-/default")) {
        return defaultImageHandler();
    }
    try {
        return attachmentLib.serveAttachment(
            req,
            storeLib.getRepoConnection(),
            player,
            player.image,
            defaultImageHandler,
            imageHelper.processImage
        );
    } catch (e) {
        log.warning(
            'Unable to process player image ("' + playerName + '"): ' + e
        );
        return defaultImageHandler();
    }
};

function defaultImageHandler() {
    return {
        body: defaultImage,
        contentType: defaultImageType,
        headers: attachmentLib.setCacheForever({}),
    };
}
