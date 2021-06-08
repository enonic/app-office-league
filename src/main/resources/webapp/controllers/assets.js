const ioLib = require('/lib/xp/io');

exports.get = function(req) {
    var path = req.url.split('assets/')[1];
    var type = getMimeType(path);

    return {
        contentType: type,
        body: ioLib.getResource('/assets/' + path).getStream()
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
