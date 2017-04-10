var portalLib = require('/lib/xp/portal');
var storeLib = require('/lib/office-league-store');
var authLib = require('/lib/xp/auth');

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
        if (!hasLeaguePermissions(id)) {
            return handleError(403, 'Not enough permissions');
        }
        setImageLeague(id);
        break;
    case 'player':
        if (!hasPlayerPermissions(id)) {
            return handleError(403, 'Not enough permissions');
        }
        setImagePlayer(id);
        break;
    case 'team':
        if (!hasTeamPermissions(id)) {
            return handleError(403, 'Not enough permissions');
        }
        setImageTeam(id);
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

var setImagePlayer = function (id) {
    var stream = portalLib.getMultipartStream('image');
    var part = portalLib.getMultipartItem('image');
    var contentType = part && part.contentType;

    storeLib.updatePlayer({
        playerId: id,
        imageStream: stream,
        imageType: contentType
    });
    storeLib.refresh();
};

var setImageTeam = function (id) {
    var stream = portalLib.getMultipartStream('image');
    var part = portalLib.getMultipartItem('image');
    var contentType = part && part.contentType;

    storeLib.updateTeam({
        teamId: id,
        imageStream: stream,
        imageType: contentType
    });
    storeLib.refresh();
};

var hasLeaguePermissions = function (leagueId) {
    if (isAdmin()) {
        return true;
    }

    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        return false;
    }
    var currentPlayerId = getCurrentPlayerId();
    var playerIsLeagueAdmin = false;
    [].concat(league.adminPlayerIds).forEach(function (playerId) {
        if (playerId === currentPlayerId) {
            playerIsLeagueAdmin = true;
        }
    });
    return playerIsLeagueAdmin;
};

var hasTeamPermissions = function (teamId) {
    if (isAdmin()) {
        return true;
    }

    var team = storeLib.getTeamById(teamId);
    if (!team) {
        return false;
    }
    var currentPlayerId = getCurrentPlayerId();
    var playerInTeam = false;
    team.playerIds.forEach(function (playerId) {
        if (playerId === currentPlayerId) {
            playerInTeam = true;
        }
    });
    return playerInTeam;
};

var hasPlayerPermissions = function (playerId) {
    if (isAdmin()) {
        return true;
    }

    var currentPlayerId = getCurrentPlayerId();
    return currentPlayerId === playerId;
};

var getCurrentPlayerId = function () {
    var user = authLib.getUser();
    if (!user) {
        return null;
    }
    var player = storeLib.getPlayerByUserKey(user.key);
    return player && player._id;
};

var isAdmin = function () {
    return authLib.hasRole('system.admin');
};