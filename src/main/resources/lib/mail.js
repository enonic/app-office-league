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

exports.sendDenyJoinRequestNotification = function (playerId, leagueId) {
    log.info('Deny join request notification email will be sent in the background.');

    taskLib.submit({
        description: 'Office League Email Sending Task',
        task: function () {
            try {
                log.info('Sending email...');
                doSendDenyJoinRequestNotification(playerId, leagueId);
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


exports.sendAllowJoinRequestNotification = function (playerId, leagueId) {
    log.info('Allow join request notification email will be sent in the background.');

    taskLib.submit({
        description: 'Office League Email Sending Task',
        task: function () {
            try {
                log.info('Sending email...');
                doSendAllowJoinRequestNotification(playerId, leagueId);
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

var doSendAllowJoinRequestNotification = function (playerId, leagueId) {
    var from = app.config['mail.from'];
    if (!from) {
        log.warning(
            'Could not send notification. From email not configured. Please add the email with property "mail.from" in com.enonic.xp.mail.cfg');
        return;
    }

    var player = storeLib.getPlayerById(playerId);
    if (!player && !player.userKey) {
        log.warning('Could not send allow join request notification. Player not found: ' + playerId);
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        log.warning('Could not send allow join request notification. League not found: ' + leagueId);
        return;
    }

    var baseUrl = app.config['officeleague.baseUrl'] || 'http://localhost:8080/portal/draft/office-league/app';
    var recipient = authLib.getPrincipal(player.userKey);
    var email = recipient.email;
    if (!email) {
        log.warning('Could not send allow join request notification. Cannot find email for admin: ' + admin.name);
        return;
    }

    var params = {
        leagueName: league.name,
        requesterName: player.name,
        requesterFullName: player.fullname,
        leagueUrl: leagueUrl(baseUrl, league)
    };
    var body = mustache.render(resolve('mail/allow.join.request.html'), params);

    sendEmail({
        from: 'Office League <' + from + '>',
        to: player.fullname ? player.fullname + ' <' + email + '>' : email,
        body: body,
        subject: 'Office League - Request to join league \'' + league.name + '\' denied'
    });
};

var doSendDenyJoinRequestNotification = function (playerId, leagueId) {
    var from = app.config['mail.from'];
    if (!from) {
        log.warning(
            'Could not send notification. From email not configured. Please add the email with property "mail.from" in com.enonic.xp.mail.cfg');
        return;
    }

    var player = storeLib.getPlayerById(playerId);
    if (!player && !player.userKey) {
        log.warning('Could not send deny join request notification. Player not found: ' + playerId);
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        log.warning('Could not send deny join request notification. League not found: ' + leagueId);
        return;
    }

    var baseUrl = app.config['officeleague.baseUrl'] || 'http://localhost:8080/portal/draft/office-league/app';
    var recipient = authLib.getPrincipal(player.userKey);
    var email = recipient.email;
    if (!email) {
        log.warning('Could not send deny join request notification. Cannot find email for admin: ' + admin.name);
        return;
    }

    var params = {
        leagueName: league.name,
        requesterName: player.name,
        requesterFullName: player.fullname
    };
    var body = mustache.render(resolve('mail/deny.join.request.html'), params);

    sendEmail({
        from: 'Office League <' + from + '>',
        to: player.fullname ? player.fullname + ' <' + email + '>' : email,
        body: body,
        subject: 'Office League - Request to join league \'' + league.name + '\' denied'
    });
};

var doSendJoinRequestNotification = function (playerId, leagueId) {
    var from = app.config['mail.from'];
    if (!from) {
        log.warning(
            'Could not send notification. From email not configured. Please add the email with property "mail.from" in com.enonic.xp.mail.cfg');
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
            requesterProfileUrl: playerUrl(baseUrl, player),
            leaguePlayersUrl: leaguePlayersUrl(baseUrl, league)
        };
        var body = mustache.render(resolve('mail/join.request.html'), params);

        sendEmail({
            from: 'Office League <' + from + '>',
            to: admin.fullname ? admin.fullname + ' <' + email + '>' : email,
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
    log.info('Send email: \r\n' + body);

    var sendResult = mail.send({
        subject: subject,
        from: from,
        to: to,
        body: body
    });
};

var leagueUrl = function (baseUrl, league) {
    return baseUrl + '/leagues/' + encodeURIComponent(league.name)
};

var leaguePlayersUrl = function (baseUrl, league) {
    return baseUrl + '/leagues/' + encodeURIComponent(league.name) + '/players'
};

var playerUrl = function (baseUrl, player) {
    return baseUrl + '/players/' + encodeURIComponent(player.name)
};