var eventLib = require('/lib/xp/event');
var storeLib = require('/lib/office-league-store');
var reportLib = require('/lib/office-league-report');
var httpClient = require('/lib/http-client');

var OFFICE_LEAGUE_GAME_REPORT_EVENT_ID = reportLib.OFFICE_LEAGUE_GAME_REPORT_EVENT_ID;
var UUID = Java.type('java.util.UUID');

/**
 * Setup an event listner so the webhook can handle the data
 */
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
            processGameWebhooks(game);
        }
    });
};

/***
 * Goes over all webhooks and tried processes the games
 * @param game -- Json data of the current game event
*/
const processGameWebhooks = function (game) {
    var urls = [];
    for (var key in app.config) {
        if (key.indexOf('webhooks.server.') === 0 && key.endsWith('.url')) {
            urls.push(app.config[key]);
        }
    }

    for (var u = 0; u < urls.length; u++) {
        /* try { */
            processGameWebhook(game, urls[u]);
       /*  } catch (e) {
            log.warning('Error posting to webhook: ' + urls[u]);
            if (e.printStackTrace) {
                e.printStackTrace();
            }
        } */
    }
};

/***
 * Creates the message data and send it to the the url
 * @param gameJson json data of the game
 * @param url url to the webhook where the game data will be sent
 */
const processGameWebhook = function (gameJson, url) {
    const event = {
        id: "evt_" + randomId(),
        event: "game.updated",
        created: Math.floor(new Date().getTime() / 1000),
        data: {
            game: gameJson
        }
    };

    // log.info(JSON.stringify(gameJson, null, 4));

    const response = httpClient.request({
        url,
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(gameJson),
    });

    if (response.status >= 300 || response.status < 200) {
        // log.info(JSON.stringify(gameJson, null, 4));
        // log.info(JSON.stringify(response, null, 4));
        log.info('Error posting webhook to [' + url + ']: ' + response.status + ' ' + response.message);
    }
};

var randomId = function () {
    return UUID.randomUUID().toString().replace(/-/g, '').toLowerCase();
};