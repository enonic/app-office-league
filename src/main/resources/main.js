var initLib = require('/lib/office-league-init');
var storeLib = require('/lib/office-league-store');
var ioLib = require('/lib/xp/io');

log.info('Application ' + app.name + ' started');

initLib.initialize();

var playerImage = ioLib.getResource('/import/images/player.png');
var teamImage = ioLib.getResource('/import/images/xp.png');

var league = storeLib.getLeagueByName('My League');
if (!league) {
    storeLib.createLeague({
        name: 'My League',
        description: 'Test league',
        sport: 'foos'
    });
    log.info('League created');
}
var player1 = storeLib.getPlayerByName('Player1');
if (!player1) {
    player1 = storeLib.createPlayer({
        name: 'Player1',
        description: 'Player One',
        handedness: 'left',
        nickname: 'The Player',
        nationality: 'us',
        imageStream: playerImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Player 1 created');
}
var player2 = storeLib.getPlayerByName('Player2');
if (!player2) {
    player2 = storeLib.createPlayer({
        name: 'Player2',
        description: 'Player Two',
        handedness: 'right',
        nickname: 'The Other Player',
        nationality: 'no',
        imageStream: playerImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Player 2 created');
}

var team = storeLib.getTeamByName('A Team');
if (!team) {
    storeLib.createTeam({
        name: 'A Team',
        description: 'The A Team',
        playerIds: [player1._id, player2._id],
        imageStream: teamImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Team created');
}

__.disposer(function () {
    log.info('Application ' + app.name + ' stopped');
});
