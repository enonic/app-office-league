var mail = require('/lib/xp/mail');
var taskLib = require('/lib/xp/task');
var mustache = require('/lib/xp/mustache');
var storeLib = require('office-league-store');
var authLib = require('/lib/xp/auth');

exports.sendJoinRequestNotification = function (playerId, leagueId) {
    log.info('Join request notification email will be sent in the background.');

    taskLib.submit({
        description: 'Office League Email Sending Task',
        task: function () {
            try {
                log.info('Sending email...');
                doSendJoinRequestNotification(playerId, leagueId);
                log.info('Email sent successfully.')
            } catch (e) {
                log.warning('Email sending failed: ' + e);
                if (e.printStackTrace) {
                    e.printStackTrace();
                }
            }
        }
    });
};

var doSendJoinRequestNotification = function (playerId, leagueId) {
    var from = app.config['mail.from'];
    if (!from) {
        log.warning(
            'Could not send join request notification. From email not configured. Please add the email with property "mail.from" in com.enonic.xp.mail.cfg');
        return;
    }

    var player = storeLib.getPlayerById(playerId);
    if (!player) {
        log.warning('Could not send join request notification. Player not found: ' + playerId);
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        log.warning('Could not send join request notification. League not found: ' + leagueId);
        return;
    }
    var adminIds = [].concat(league.adminPlayerIds || []);
    if (adminIds.length === 0) {
        log.warning('Could not send join request notification. No admins found in league: ' + leagueId);
        return;
    }
    var adminPlayers = storeLib.getPlayersById(adminIds);

    var baseUrl = app.config['officeleague.baseUrl'] || 'http://localhost:8080/portal/draft/office-league/app';
    var a, admin;
    for (a = 0; a < adminPlayers.length; a++) {
        admin = adminPlayers[a];
        var recipient = authLib.getPrincipal(admin.userKey);
        var email = recipient.email;
        if (!email) {
            log.warning('Could not send join request notification. Cannot find email for admin: ' + admin.name);
            return;
        }

        var params = {
            leagueName: league.name,
            recipientName: admin.name,
            recipientFullName: admin.fullname,
            requesterName: player.name,
            requesterFullName: player.fullname,
            requesterProfileUrl: baseUrl + '/players/' + player.name,
            allowRequestUrl: baseUrl + '/action/allow-join-request?id=' + player._id,
            denyRequestUrl: baseUrl + '/action/deny-join-request?id=' + player._id
        };
        var body = mustache.render(resolve('mail/join.request.html'), params);

        sendEmail({
            from: 'Office League <' + from + '>',
            to: email,
            body: body,
            subject: 'Office League - Join League Request from \'' + player.name + '\''
        });

    }
};

var sendEmail = function (params) {
    var subject = params.subject;
    var from = params.from;
    var to = params.to;
    var body = params.body;

    var sendResult = mail.send({
        subject: subject,
        from: from,
        to: to,
        body: body
    });
};
