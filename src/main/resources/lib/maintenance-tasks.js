var taskLib = require('/lib/xp/task');
var storeLib = require('office-league-store');
var contextLib = require('/lib/xp/context');

var GameGCTaskPeriod = 60; // 1 minute
var UnfinishedGameMaxTimeSeconds = 60 * 60; // 1 hour
var MaxSleepPeriod = 10; // 10 sec

var gameGCTaskId;
var gameGCTaskLastRun;

exports.launchGameGCTask = function () {
    gameGCTaskId = taskLib.submit({
        description: 'Remove abandoned games',
        task: function () {
            var id = gameGCTaskId;
            log.info('Game GC task started');
            gameGCTaskLastRun = gameGCTaskLastRun || new Date();
            var now, secSinceLastRun, sleepSec;

            while (gameGCTaskId === id) {
                now = new Date();
                secSinceLastRun = secondsBetween(gameGCTaskLastRun, now);

                if (secSinceLastRun < GameGCTaskPeriod) {
                    sleepSec = (GameGCTaskPeriod - secSinceLastRun);
                    sleepSec = sleepSec > MaxSleepPeriod ? MaxSleepPeriod : MaxSleepPeriod;
                    taskLib.sleep((sleepSec * 1000));

                } else {
                    runGameGCTask();
                    gameGCTaskLastRun = new Date();
                }
            }
            log.info('Game GC task terminated');
        }
    });
};

exports.cancelGameGCTask = function () {
    gameGCTaskId = null;
};

var runGameGCTask = function () {
    try {
        doRunGameGCTask();
    } catch (e) {
        log.error('Error running Game GC task: ' + e);
    }
};

var doRunGameGCTask = function () {
    taskLib.progress({info: 'Starting abandoned games garbage collection'});
    var gamesResp = storeLib.getUnfinishedGames(0, 0);
    var total = gamesResp.total || 0;
    taskLib.progress({info: 'Retrieving unfinished games', current: 0, total: total});

    var start = 0, gameIds = [], g, game;
    do {
        gamesResp = storeLib.getUnfinishedGames(start, 10);
        if (gamesResp.count === 0) {
            break;
        }

        for (g = 0; g < gamesResp.hits.length; g++) {
            game = gamesResp.hits[g];
            if (canGarbageCollectGame(game)) {
                gameIds.push(game._id);
            }
        }
        taskLib.progress({info: 'Processing unfinished games', current: start + gamesResp.count, total: total});
        start += 10;
    } while (gamesResp.count > 0);

    if (gameIds.length > 0) {
        taskLib.progress({info: 'Garbage collecting ' + gameIds.length + ' games', current: 0, total: 0});
        log.info(gameIds.length + ' games can be removed');
        for (g = 0; g < gameIds.length; g++) {
            log.info('Deleting game ' + gameIds[g]);
            deleteGame(gameIds[g]);
        }
    }

    taskLib.progress({info: 'Done!'});
};

var deleteGame = function (gameId) {
    contextLib.run({
        repository: storeLib.REPO_NAME,
        branch: 'master',
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.authenticated"]
    }, function () {
        storeLib.deleteGameById(gameId);
    });
};

var secondsBetween = function (t1, t2) {
    return Math.floor(Math.abs(t2.getTime() - t1.getTime()) / 1000);
};

var canGarbageCollectGame = function (game) {
    var now = new Date();
    var lastChange = parseDate(game._timestamp);
    var secSinceLastChange = secondsBetween(lastChange, now);
    return secSinceLastChange > UnfinishedGameMaxTimeSeconds;
};

var parseDate = function (value) {
    if (value) {
        try {
            return new Date(value);
        } catch (e) {
            console.warn("Could not parse date from: " + value);
        }
    }
    return null;
};
