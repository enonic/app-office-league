var repoLib = require('/lib/xp/repo');
var valueLib = require('/lib/xp/value');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');

var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';
var PUSH_SUBSCRIPTIONS_PATH = '/push-subscriptions';

var ROOT_PERMISSIONS = [
    {
        "principal": "role:system.authenticated",
        "allow": [
            "READ",
            "CREATE",
            "MODIFY",
            "DELETE",
            "PUBLISH",
            "READ_PERMISSIONS",
            "WRITE_PERMISSIONS"
        ],
        "deny": []
    },
    {
        "principal": "role:system.everyone",
        "allow": ["READ"],
        "deny": []
    }
];

exports.initialize = function () {
    log.info('Initializing Office League repository...');

    contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, doInitialize);


    log.info('Office League repository initialized.');
};

var doInitialize = function () {
    var result = repoLib.get(REPO_NAME);

    if (result) {
        log.info('Repository found');
    } else {
        log.info('Repository not found');
        createRepo();
    }
    createRootNodes();

    //createSite();
};

var createRepo = function () {
    log.info('Creating repository...');
    var newRepo = repoLib.create({
        id: REPO_NAME,
        rootPermissions: ROOT_PERMISSIONS
    });
    log.info('Repository created.');
};

var createRootNodes = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master'
    });

    var leaguesExist = nodeWithPathExists(repoConn, LEAGUES_PATH);
    if (!leaguesExist) {
        log.info('Creating node [' + LEAGUES_PATH + '] ...');
        var leaguesNode = repoConn.create({
            _name: LEAGUES_PATH.slice(1),
            _parentPath: '/',
            _inheritsPermissions: true
        });
    }
    var teamsExist = nodeWithPathExists(repoConn, TEAMS_PATH);
    if (!teamsExist) {
        log.info('Creating node [' + TEAMS_PATH + '] ...');
        var teamsNode = repoConn.create({
            _name: TEAMS_PATH.slice(1),
            _parentPath: '/',
            _inheritsPermissions: true
        });
    }
    var playersExist = nodeWithPathExists(repoConn, PLAYERS_PATH);
    if (!playersExist) {
        log.info('Creating node [' + PLAYERS_PATH + '] ...');
        var playersNode = repoConn.create({
            _name: PLAYERS_PATH.slice(1),
            _parentPath: '/',
            _inheritsPermissions: true
        });
    }
    var pushSubscriptionsExist = nodeWithPathExists(repoConn, PUSH_SUBSCRIPTIONS_PATH);
    if (!pushSubscriptionsExist) {
        log.info('Creating node [' + PUSH_SUBSCRIPTIONS_PATH + '] ...');
        var playersNode = repoConn.create({
            _name: PUSH_SUBSCRIPTIONS_PATH.slice(1),
            _parentPath: '/',
            _inheritsPermissions: true
        });
    }
};

var nodeWithPathExists = function (repoConnection, path) {
    var result = repoConnection.query({
        start: 0,
        count: 0,
        query: "_path = '" + path + "'"
    });
    return result.total > 0;
};