var mail = require('/lib/xp/mail');
var taskLib = require('/lib/xp/task');
var mustache = require('/lib/mustache');
var storeLib = require('office-league-store');
var authLib = require('/lib/xp/auth');
var ioLib = require('/lib/xp/io');

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


exports.sendInvitation = function (email, leagueId, adminId, token) {
    log.info('Invitation email will be sent in the background.');

    taskLib.submit({
        description: 'Office League Email Sending Task',
        task: function () {
            try {
                log.info('Sending email...');
                doSendInvitation(email, leagueId, adminId, token);
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
        throw 'Could not send notification. From email not configured. Please add the email with property "mail.from" in com.enonic.app.officeleague.cfg';
        return;
    }

    var player = storeLib.getPlayerById(playerId);
    if (!player && !player.userKey) {
        throw 'Could not send allow join request notification. Player not found: ' + playerId;
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        throw 'Could not send allow join request notification. League not found: ' + leagueId;
        return;
    }

    var baseUrl = getBaseUrl();
    var recipient = authLib.getPrincipal(player.userKey);
    var email = recipient.email;
    if (!email) {
        throw 'Could not send allow join request notification. Cannot find email for admin: ' + admin.name;
        return;
    }

    var params = {
        leagueName: league.name,
        requesterName: player.name,
        requesterFullName: player.fullname,
        leagueUrl: leagueUrl(baseUrl, league),
        logoUrl: getLogoUrl(baseUrl)
    };
    var body = mustache.render(resolve('mail/allow.join.request.html'), params);

    sendEmail({
        from: 'Office League <' + from + '>',
        to: player.fullname ? player.fullname + ' <' + email + '>' : email,
        body: body,
        subject: 'Office League - Request to join league \'' + league.name + '\' approved'
    });
};

var doSendDenyJoinRequestNotification = function (playerId, leagueId) {
    var from = app.config['mail.from'];
    if (!from) {
        throw 'Could not send notification. From email not configured. Please add the email with property "mail.from" in com.enonic.app.officeleague.cfg';
        return;
    }

    var player = storeLib.getPlayerById(playerId);
    if (!player && !player.userKey) {
        throw 'Could not send deny join request notification. Player not found: ' + playerId;
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        throw 'Could not send deny join request notification. League not found: ' + leagueId;
        return;
    }

    var baseUrl = getBaseUrl();
    var recipient = authLib.getPrincipal(player.userKey);
    var email = recipient.email;
    if (!email) {
        throw 'Could not send deny join request notification. Cannot find email for admin: ' + admin.name;
        return;
    }

    var params = {
        leagueName: league.name,
        requesterName: player.name,
        requesterFullName: player.fullname,
        logoUrl: getLogoUrl(baseUrl)
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
        throw 'Could not send notification. From email not configured. Please add the email with property "mail.from" in com.enonic.app.officeleague.cfg';
        return;
    }

    var player = storeLib.getPlayerById(playerId);
    if (!player) {
        throw 'Could not send join request notification. Player not found: ' + playerId;
        return;
    }
    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        throw 'Could not send join request notification. League not found: ' + leagueId;
        return;
    }
    var adminIds = [].concat(league.adminPlayerIds || []);
    if (adminIds.length === 0) {
        throw 'Could not send join request notification. No admins found in league: ' + leagueId;
        return;
    }
    var adminPlayers = storeLib.getPlayersById(adminIds);

    var baseUrl = getBaseUrl();
    var a, admin;
    for (a = 0; a < adminPlayers.length; a++) {
        admin = adminPlayers[a];
        var recipient = authLib.getPrincipal(admin.userKey);
        var email = recipient.email;
        if (!email) {
            throw 'Could not send join request notification. Cannot find email for admin: ' + admin.name;
            return;
        }

        var params = {
            leagueName: league.name,
            recipientName: admin.name,
            recipientFullName: admin.fullname,
            requesterName: player.name,
            requesterFullName: player.fullname,
            requesterProfileUrl: playerUrl(baseUrl, player),
            requesterImageUrl: playerImageUrl(baseUrl, player),
            leaguePlayersUrl: leaguePlayersUrl(baseUrl, league, true),
            logoUrl: getLogoUrl(baseUrl)
        };
        var body = mustache.render(resolve('mail/join.request.html'), params);

        sendEmail({
            from: 'Office League <' + from + '>',
            to: admin.fullname ? admin.fullname + ' <' + email + '>' : email,
            body: body,
            subject: 'Office League - Join League Request from \'' + player.name + '\''
            // attachments: [{
            //     fileName: 'logo.png',
            //     mimeType: 'image/png',
            //     data: getLogoImage()
            // }]
        });

    }
};

var doSendInvitation = function (email, leagueId, adminId, token) {
    var from = app.config['mail.from'];
    if (!from) {
        throw 'Could not send email. From email not configured. Please add the email with property "mail.from" in com.enonic.app.officeleague.cfg';
        return;
    }

    var league = storeLib.getLeagueById(leagueId);
    if (!league) {
        throw 'Could not send invitation. League not found: ' + leagueId;
        return;
    }

    var admin = storeLib.getPlayerById(adminId);
    if (!admin) {
        throw 'Could not send invitation. Admin not found: ' + adminId;
        return;
    }

    var callbackUrl = app.config['officeleague.baseUrl']
        ? app.config['officeleague.baseUrl'] + '/player-create?invitation=' + token
        : 'http://localhost:8080/portal/draft/office-league/app/player-create?invitation=' + token;

    var baseUrl = getBaseUrl();

    var params = {
        logoUrl: getLogoUrl(baseUrl),
        leagueName: league.name,
        leagueImageUrl: leagueImageUrl(baseUrl, league),
        leagueUrl: leagueUrl(baseUrl, league),
        requesterName: admin.name,
        requesterProfileUrl: playerUrl(baseUrl, admin),
        requesterImageUrl: playerImageUrl(baseUrl, admin),
        callbackUrl: callbackUrl
    };
    var body = mustache.render(resolve('mail/invitation.request.html'), params);

    sendEmail({
        from: 'Office League <' + from + '>',
        to: email,
        body: body,
        subject: 'Office League - Invitation to join league \'' + league.name + '\''
    });
};

var sendEmail = function (params) {
    var subject = params.subject;
    var from = params.from;
    var to = params.to;
    var body = params.body;
    var attachments = params.attachments;

    mail.send({
        subject: subject,
        from: from,
        to: to,
        body: body,
        contentType: 'text/html; charset="UTF-8"',
        attachments: attachments
    });
};

var leagueUrl = function (baseUrl, league) {
    return baseUrl + '/leagues/' + encodeURIComponent(league.name)
};

var leaguePlayersUrl = function (baseUrl, league, requireLogin) {
    var url = baseUrl + '/leagues/' + encodeURIComponent(league.name) + '/players';
    if (requireLogin) {
        url = url + '?login=yes';
    }
    return url;
};

var playerUrl = function (baseUrl, player) {
    return baseUrl + '/players/' + encodeURIComponent(player.name)
};

var playerImageUrl = function (baseUrl, player) {
    var attachmentImg = storeLib.getAttachment(player, player.image);
    log.info(JSON.stringify(attachmentImg,null,4));
    if (!attachmentImg || attachmentImg.mimeType.indexOf('image/svg+xml') === 0) {
        return baseUrl + '/assets/icons/default-player.png';
    } else {
        return baseUrl + storeLib.getImageUrl(player);
    }
};

var leagueImageUrl = function (baseUrl, league) {
    return baseUrl + storeLib.getImageUrl(league);
};

var getLogoUrl = function (baseUrl) {
    return baseUrl + '/assets/icons/office-league-logo.png';
};

var getLogoImage = function () {
    var logoRes = ioLib.getResource('/assets/icons/office-league-logo.png');
    return logoRes.getStream();
};

var getBaseUrl = function () {
    return app.config['officeleague.baseUrl'] || 'http://localhost:8080/portal/draft/office-league/app';
};