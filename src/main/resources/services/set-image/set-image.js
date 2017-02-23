var portalLib = require('/lib/xp/portal');
var storeLib = require('/lib/office-league-store');

exports.post = function (req) {
    var entityType = portalLib.getMultipartText('type');
    var id = portalLib.getMultipartText('id');
    if (!id) {
        return handleError(400, 'Expected id parameter');
    }
    if (!isValidType(entityType)) {
        return handleError(400, 'Invalid type: [' + (entityType || '') + ']');
    }

    switch (entityType) {
    case 'league':
        setImageLeague(id);
        break;
    }

    return {
        contentType: 'application/json',
        body: {
            success: true,
            id: id
        }
    };
};

var isValidType = function (value) {
    return value === 'league' || value === 'player' || value === 'team';
};

var handleError = function (status, message) {
    return {
        contentType: 'application/json',
        status: status,
        body: {
            message: message
        }
    }
};

var setImageLeague = function (id) {
    var stream = portalLib.getMultipartStream('image');
    var part = portalLib.getMultipartItem('image');
    var contentType = part && part.contentType;

    storeLib.updateLeague({
        leagueId: id,
        imageStream: stream,
        imageType: contentType
    });
    storeLib.refresh();
};