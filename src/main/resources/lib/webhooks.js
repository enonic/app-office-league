var eventLib = require('/lib/xp/event');
var storeLib = require('office-league-store');
var reportLib = require('office-league-report');
var httpClient = require('/lib/xp/http-client');

var OFFICE_LEAGUE_GAME_REPORT_EVENT_ID = reportLib.OFFICE_LEAGUE_GAME_REPORT_EVENT_ID;
var UUID = Java.type('java.util.UUID');

exports.setupWebHooks = function () {
    eventLib.listener({
        type: 'custom.' + OFFICE_LEAGUE_GAME_REPORT_EVENT_ID,
        localOnly: true,
        callback: function (event) {
            var enabled = app.config['webhooks.enabled'] === 'true';
            if (!enabled) {
                return;
            }

            var game = JSON.parse(event.data.game);
            processGameWebhook(game, baseUrl);
        }
    });
};

var processGameWebhooks = function (game) {
    var urls = [];
    for (var key in app.config) {
        if (key.indexOf('webhooks.server.') === 0 && key.endsWith('.url')) {
            urls.push(app.config[key]);
        }
    }

    for (var u = 0; u < urls.length; u++) {
        try {
            postWebhook(game, urls[u]);
        } catch (e) {
            log.warning('Error posting to webhook: ' + urls[u]);
            if (e.printStackTrace) {
                e.printStackTrace();
            }
        }
    }
};

var processGameWebhook = function (gameJson, url) {
    var event = {
        id: "evt_" + randomId(),
        event: "game.updated",
        created: Math.floor(new Date().getTime() / 1000),
        data: {
            game: gameJson
        }
    };

    var response = httpClient.request({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(event),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status >= 300 || response.status < 200) {
        log.info('Error posting webhook to [' + url + ']: ' + response.status + ' ' + response.message);
    }
};

var randomId = function () {
    return UUID.randomUUID().toString().replace(/-/g, '').toLowerCase();
};