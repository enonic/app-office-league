var ioLib = require('/lib/xp/io');

exports.get = function (req) {
    var path = req.url.split('app/assets/')[1];
    var type = ioLib.getMimeType(path);

    return {
        contentType: type,
        body: ioLib.getResource('/assets/' + path).getStream()
    };
};