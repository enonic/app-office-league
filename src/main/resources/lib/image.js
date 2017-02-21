/**
 * This function processes an image stored as a binary property in a node.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.id Id of the node with the image.
 * @param {string} params.name Attachment name or image property in the node.
 * @param {string} params.scale Scaling for the image. Possible values : width(px), height(px), block(width,height), square(px), max(px), wide(width).
 * @param {number} [params.quality=85] Quality for JPEG images, ranges from 0 (max compression) to 100 (min compression).
 * @param {string} [params.background] Background color in RGB, as hexadecimal number.
 * @param {string} [params.format] Format of the image: 'png', 'jpeg', 'gif'.
 * @param {string} [params.mimeType] Mime type of the image. Alternative to format parameter.
 * @param {string} [params.filter] Filters to apply to the image. Examples: block(5), blur(3), border(4, 0x777777), emboss(), grayscale(), invert(),
 * sharpen(), rounded(5), rgbadjust(2.0,0.25,-1.75), hsbadjust(-0.15,0.2,-0.2), edge(), bump(), sepia(20), rotate90(), rotate180(), rotate270(),
 * fliph(), flipv(), colorize(3,1,1.5), hsbcolorize(0x00AAAA).
 *
 * @returns {stream} The generated image stream.
 */
exports.processImage = function (params) {
    var bean = __.newBean('com.enonic.app.officeleague.image.ImageHandler');
    bean.id = __.nullOrValue(checkRequired(params, 'id'));
    bean.name = __.nullOrValue(checkRequired(params, 'name'));
    bean.scale = __.nullOrValue(checkRequired(params, 'scale'));
    bean.quality = __.nullOrValue(params.quality);
    bean.background = __.nullOrValue(params.background);
    bean.format = __.nullOrValue(params.format);
    bean.mimeType = __.nullOrValue(params.mimeType);
    bean.filter = __.nullOrValue(params.filter);
    return bean.process();
};

var checkRequired = function (params, name) {
    if (params[name] === undefined) {
        throw "Parameter '" + name + "' is required";
    }
    return params[name];
};
