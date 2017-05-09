var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');
var storeLib = require('./office-league-store');

exports.removeInvitationByToken = function(token) {
    var invitationHit = storeLib.getAdminRepoConnection().query({
        start: 0,
        count: 1,
        query: "type = '" + storeLib.TYPE.INVITATION + "' AND token = '" + token + "'" 
    }).hits[0];
    
    if (invitationHit) {
        var invitation = storeLib.getAdminRepoConnection().get(invitationHit.id);
        if (invitation) {
            storeLib.getAdminRepoConnection().delete(invitationHit.id);
            if (isInvitationValid(invitation)) {
                return invitation;
            }
        }        
    }
    return null;
};

function isInvitationValid (invitation) {
    return true;
    //return ((invitation.timestamp - Date.now()) < 86400000); TODO
}

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
            timestamp : Date.now(),
            leagueId: leagueId
        });
    }
    return null;
};

function doGenerateToken() {
    var bean = __.newBean('com.enonic.app.officeleague.token.TokenGeneratorService');
    return bean.generateToken();
}