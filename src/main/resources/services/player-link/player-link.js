var authLib = require('/lib/xp/auth');
var storeLib = require('/lib/office-league-store');

// Assign currently logged in user with a player. For testing purposes.
exports.get = function (req) {
    var playerName = req.params['player'];
    var unlink = req.params['unlink'] === 'true';
    if (!playerName) {
        return {
            contentType: 'application/json',
            status: 400,
            body: {
                message: 'Missing player parameter'
            }
        }
    }

    var user = authLib.getUser();
    if (!user) {
        return {
            contentType: 'application/json',
            status: 400,
            body: {
                message: 'User not logged in'
            }
        }
    }

    var player = storeLib.getPlayerByName(playerName);
    if (!player) {
        return {
            contentType: 'application/json',
            status: 400,
            body: {
                message: 'Player not found'
            }
        }
    }
    if (unlink) {
        storeLib.updatePlayer({
            playerId: player._id,
            userKey: ''
        });

        return {
            contentType: 'application/json',
            status: 200,
            body: {
                message: 'Player [' + player.name + '] unlinked from user'
            }
        }
    }

    if (player.userKey) {
        return {
            contentType: 'application/json',
            status: 400,
            body: {
                message: 'Player already assigned with a user'
            }
        }
    }

    storeLib.updatePlayer({
        playerId: player._id,
        userKey: user.key
    });

    return {
        contentType: 'application/json',
        status: 200,
        body: {
            message: 'Player [' + player.name + '] assigned to user [' + user.key + ']'
        }
    }
};
