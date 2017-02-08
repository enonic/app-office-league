var repoLib = require('/lib/xp/repo');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var contentLib = require('/lib/xp/content');

var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';

var DEFAULT_SITE_NAME = 'office-league';
var DEFAULT_SITE_PATH = '/' + DEFAULT_SITE_NAME;

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

    createSite();
};

var createSite = function () {
    var result = contentLib.get({
        key: DEFAULT_SITE_PATH,
        branch: 'draft'
    });
    if (!result) {
        log.info('Creating Site content...');
        var siteContent = contentLib.create({
            name: DEFAULT_SITE_NAME,
            parentPath: '/',
            displayName: 'Office League',
            branch: 'draft',
            contentType: 'portal:site',
            data: {
                // siteConfig: {
                //     applicationKey: app.name,
                //     config: {}
                // }
            },
            x: {}
        });
        var repoConn = nodeLib.connect({
            repoId: 'cms-repo',
            branch: 'draft',
            principals: ["role:system.admin"]
        });
        repoConn.modify({
            key: siteContent._id,
            editor: function (node) {
                node.data = node.data || {};
                node.data.siteConfig = {
                    applicationKey: app.name,
                    config: {}
                };
                return node;
            }
        });

        log.info('Creating PWA page template...');
        var templateContent = contentLib.create({
            name: 'pwa',
            parentPath: siteContent._path + '/_templates',
            displayName: 'PWA',
            branch: 'draft',
            contentType: 'portal:page-template',
            data: {
                supports: 'portal:site'
            }
        });
        // add page to template
        repoConn.modify({
            key: templateContent._id,
            editor: function (node) {
                node.page = {
                    controller: app.name + ':pwa',
                    config: {},
                    regions: {},
                    customized: false
                };
                return node;
            }
        });
    }
};

var createRepo = function () {
    log.info('Creating repository...');
    var newRepo = repoLib.create({
        id: REPO_NAME,
        rootPermissions: [
            {
                "principal": "role:system.admin",
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
            }
        ]
    });
    log.info('Repository created.');
};

var createRootNodes = function () {
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });

    var leaguesExist = nodeWithPathExists(repoConn, LEAGUES_PATH);
    if (!leaguesExist) {
        log.info('Creating node [' + LEAGUES_PATH + '] ...');
        var leaguesNode = repoConn.create({
            _name: LEAGUES_PATH.slice(1),
            _parentPath: '/'
        });
    }
    var teamsExist = nodeWithPathExists(repoConn, TEAMS_PATH);
    if (!teamsExist) {
        log.info('Creating node [' + TEAMS_PATH + '] ...');
        var teamsNode = repoConn.create({
            _name: TEAMS_PATH.slice(1),
            _parentPath: '/'
        });
    }
    var playersExist = nodeWithPathExists(repoConn, PLAYERS_PATH);
    if (!playersExist) {
        log.info('Creating node [' + PLAYERS_PATH + '] ...');
        var playersNode = repoConn.create({
            _name: PLAYERS_PATH.slice(1),
            _parentPath: '/'
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