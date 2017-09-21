var repoLib = require('/lib/xp/repo');
var valueLib = require('/lib/xp/value');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var contentLib = require('/lib/xp/content');
var ioLib = require('/lib/xp/io');

var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';
var PUSH_SUBSCRIPTIONS_PATH = '/push-subscriptions';

var DEFAULT_SITE_NAME = 'office-league';
var DEFAULT_SITE_PATH = '/' + DEFAULT_SITE_NAME;

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
                // siteConfig: { //TODO Adapt function in Enonic XP
                //     applicationKey: app.name,
                //     config: {}
                // }
            },
            x: {}
        });

        var getStartedStream = ioLib.getResource('/import/get-started.png').getStream();
        var getStartedMedia = contentLib.createMedia({
            name: 'Get Started Image',
            parentPath: DEFAULT_SITE_PATH,
            mimeType: 'image/png',
            branch: 'draft',
            data: getStartedStream
        });

        log.info('Adding Site page components...');
        var repoConn = nodeLib.connect({
            repoId: 'cms-repo',
            branch: 'draft'
        });
        repoConn.modify({
            key: siteContent._id,
            editor: function (node) {
                node.page = {
                    "controller": app.name + ":marketing-page",
                    "region": {
                        "name": "main",
                        "component": [
                            {
                                "type": "LayoutComponent",
                                "LayoutComponent": {
                                    "name": "1 column layout",
                                    "template": "com.enonic.app.officeleague:layout-1-col",
                                    "config": {
                                        "paddingTop": false,
                                        "paddingBottom": true
                                    },
                                    "region": {
                                        "name": "main",
                                        "component": {
                                            "type": "TextComponent",
                                            "TextComponent": {
                                                "name": "Text",
                                                "text": "<h1 style=\"text-align: center;\">Take foosball to the next level!</h1>" +
                                                        "<p class=\"justify\"><img src=\"image://" + getStartedMedia._id +
                                                        "?keepSize=true\" alt=\"Frame\" style=\"width: 100%; text-align: justify;\" />" +
                                                        "</p><h3 style=\"text-align: center;\">Create your league, invite and play to rule your opponents.</h3>" +
                                                        "<p style=\"text-align: center;\"><a href=\"app\" class=\"global__button\">GET STARTED</a></p>"
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    "config": {},
                    "customized": true
                };
                return node;
            }
        });

        log.info('Set Site permissions...');
        contentLib.setPermissions({
            key: siteContent._id,
            inheritPermissions: false,
            overwriteChildPermissions: true,
            permissions: [{
                principal: 'role:system.everyone',
                allow: ['READ'],
                deny: [] //TODO This parameters should be optional in the lib. Adapt function in Enonic XP
            }, {
                principal: 'role:cms.cm.app',
                allow: ['CREATE', 'MODIFY', 'DELETE', 'PUBLISH'],
                deny: [] //TODO This parameters should be optional in the lib. Adapt function in Enonic XP
            }]
        });

        log.info('Assigning application to site...');
        var repoConn = nodeLib.connect({
            repoId: 'cms-repo',
            branch: 'draft'
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

        log.info('Creating App content...');
        var appContent = contentLib.create({
            name: 'app',
            parentPath: siteContent._path,
            displayName: 'App',
            branch: 'draft',
            contentType: app.name + ':app',
            data: {},
            x: {}
        });

        log.info('Creating PWA page template...');
        var templateContent = contentLib.create({
            name: 'pwa',
            parentPath: siteContent._path + '/_templates',
            displayName: 'PWA page template',
            branch: 'draft',
            contentType: 'portal:page-template',
            data: {
                supports: [app.name + ':app', app.name + ':info-page']
            }
        });
        // add page to template
        repoConn.modify({
            key: templateContent._id,
            editor: function (node) {
                node.page = {
                    controller: app.name + ':pwa',
                    config: {},
                    customized: false
                };
                return node;
            }
        });

        log.info('Creating Marketing page template...');
        var marketingTemplateContent = contentLib.create({
            name: 'marketing-page',
            parentPath: siteContent._path + '/_templates',
            displayName: 'Marketing page template',
            branch: 'draft',
            contentType: 'portal:page-template',
            data: {
                supports: 'portal:site'
            }
        });
        // add page to template
        repoConn.modify({
            key: marketingTemplateContent._id,
            editor: function (node) {
                node.page = {
                    controller: app.name + ':marketing-page',
                    config: {},
                    region: {
                        name: 'main'
                    },
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
            _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
        });
    }
    var teamsExist = nodeWithPathExists(repoConn, TEAMS_PATH);
    if (!teamsExist) {
        log.info('Creating node [' + TEAMS_PATH + '] ...');
        var teamsNode = repoConn.create({
            _name: TEAMS_PATH.slice(1),
            _parentPath: '/',
            _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
        });
    }
    var playersExist = nodeWithPathExists(repoConn, PLAYERS_PATH);
    if (!playersExist) {
        log.info('Creating node [' + PLAYERS_PATH + '] ...');
        var playersNode = repoConn.create({
            _name: PLAYERS_PATH.slice(1),
            _parentPath: '/',
            _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
        });
    }
    var pushSubscriptionsExist = nodeWithPathExists(repoConn, PUSH_SUBSCRIPTIONS_PATH);
    if (!pushSubscriptionsExist) {
        log.info('Creating node [' + PUSH_SUBSCRIPTIONS_PATH + '] ...');
        var playersNode = repoConn.create({
            _name: PUSH_SUBSCRIPTIONS_PATH.slice(1),
            _parentPath: '/',
            _permissions: ROOT_PERMISSIONS //TODO Remove after XP issue 4801 resolution
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