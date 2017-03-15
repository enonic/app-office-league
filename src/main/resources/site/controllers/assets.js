var ioLib = require('/lib/xp/io');

exports.get = function (req) {
    var path = req.url.split('assets/')[1];
    var type = ioLib.getMimeType(path);

    log.info('Serving asset of type: ' + type + ' at ' + path);

    return {
        contentType: type,
        body: ioLib.getResource('/assets/' + path).getStream()
    };
};