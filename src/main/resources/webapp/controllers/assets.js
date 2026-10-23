const ioLib = require('/lib/xp/io');

exports.get = function(req) {
    var path = req.url.split('assets/')[1];
    var resource = ioLib.getResource('/assets/' + path);
    if (!resource.exists()) {
        return {status: 404};
    }

    return {
        contentType: getMimeType(path),
        body: resource.getStream()
    };
};

const getMimeType = function (path) {
    var type = ioLib.getMimeType(path);
    if (type && type !== 'application/octet-stream') {
        return type
    }

    var ext = path.indexOf('.') > 0 ? path.split('.').pop().toLowerCase() : '';

    if (ext.indexOf('mp3') > -1) {
        type = 'audio/mp3';
    } else if (ext.indexOf('wav') > -1) {
        type = 'audio/wav';
    }

    return type;
};
