var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');
var storeLib = require('./office-league-store');

exports.isTokenValid = function (token) {
    var invitation = exports.findInvitationByToken(token);
    if (invitation) {
        var timestamp = invitation.timestamp;
        if ((timestamp - Date.now()) < 86400000) {
            return true;
        } else {
            storeLib.getAdminRepoConnection().delete(invitation._id);
        }
    }
    return false;
};

exports.findInvitationByToken = function(token) {
    var invitationQueryHit = storeLib.getAdminRepoConnection().query({
        start: 0,
        count: 1,
        query: "token = '" + token + "'" 
    }).hits[0];
    return invitationQueryHit && storeLib.getAdminRepoConnection().get(invitationQueryHit.id);
};

exports.createInvitation = function (leagueId) {
    var league = storeLib.getLeagueById(leagueId);
    if (league) {
        var token = doGenerateToken();
        return storeLib.getRepoConnection().create({
            _name: token,
            _parentPath: league._path + '/invitations',
            _permissions: storeLib.ROOT_PERMISSIONS, //TODO Remove after XP issue 4801 resolution
            type: storeLib.TYPE.INVITATION,
            token: token,
            timestamp : Date.now()
        });
    }
    return null;
};

function doGenerateToken() {
    var bean = __.newBean('com.enonic.app.officeleague.token.TokenGeneratorService');
    return bean.generateToken();
}