const portalLib = require("/lib/xp/portal");
const authLib = require("/lib/xp/auth");
const mustacheLib = require("/lib/mustache");
const storeLib = require("/lib/office-league-store");
const invitationLib = require("/lib/invitation");
const pushLib = require("/lib/push");
const geoipLib = require("/lib/geoip");
const router = require("/lib/router")();
const sw = require("/lib/pwa/sw-controller.js");
const manifest = require("/lib/pwa/manifest-controller.js");

const controllers = {
    assets: require("./controllers/assets.js"),
    grapql: require("../services/graphql/graphql.js"),
    playerImage: require("./controllers/player-image.js"),
    leagueImage: require("./controllers/league-image.js"),
    teamImage: require("./controllers/team-image.js"),
};

const view = resolve("webapp.html");

// All request to the webapp
exports.all = function (req) {
    return router.dispatch(req);
};

// Assets where served by this endpoint
// https://github.com/enonic/app-office-league/issues/459
router.get("/assets/{path}/{file}", function (req) {
    return controllers.assets.get(req);
});

router.get("/assets/img/flags/{file}", function (req) {
    return controllers.assets.get(req);
})

// Image asset routs
router.get("/teams/image/{id}/{name}/", function(req) {
    return controllers.teamImage.get(req);
});
router.get("/players/image/{id}/{name}", function(req) {
    return controllers.playerImage.get(req);
});
router.get("/leagues/image/{id}/{path}", function (req) {
    return controllers.leagueImage.get(req);
});
router.get("/service-worker.js", function(req) {
    return sw.get(req);
});

router.post("/api/graphql", function (req) {
    return controllers.grapql.post(req);
});

router.get("/manifest.json", function(req) {
    return manifest.get(req);
});

router.get("/", defaultRout);
router.get("/player-create", defaultRout);

function defaultRout(req) {
    let baseHref = portalLib.pageUrl({ path: '/', type: 'relative' });
    let baseAbsoluteUrl = portalLib.pageUrl({ path: '/', type: 'absolute' });

    if (mustLogIn(req)) {
        return {
            redirect: portalLib.loginUrl({
                type: "absolute",
                redirect: req.url,
            }),
        };
    }

    var user = authLib.getUser();
    if (!user && hasLoginSuggestParam(req)) {
        return {
            redirect: portalLib.loginUrl({
                type: "absolute",
                redirect: req.url,
            }),
        };
    }

    if (isPlayerCreatePage(req, baseHref)) {
        if (req.params.invitation) {
            var player = getPlayer();
            if (player) {
                var invitation = invitationLib.removeInvitationByToken(
                    req.params.invitation
                );
                if (invitation) {
                    storeLib.joinPlayerLeague(invitation.leagueId, player._id);
                    storeLib.refresh();
                }
            }
        }
    } else {
        if (isLoggedInUserWithoutPlayer()) {
            return {
                redirect: baseHref + "/player-create",
            };
        }
    }

    var userObj = user && { key: user.key };
    if (user) {
        var player = storeLib.getPlayerByUserKey(user.key);
        userObj.playerId = player && player._id;
        userObj.playerName = (player && player.name) || user.displayName;
        userObj.playerImageUrl = player ? baseHref + player.imageUrl : "";
        userObj.isAdmin = authLib.hasRole("system.admin");
    }

    var countryIsoCode;
    if (req.remoteAddress) {
        var locationData = geoipLib.getLocationData(req.remoteAddress);
        countryIsoCode = geoipLib.countryISO(locationData);
    }
    countryIsoCode = countryIsoCode || "no";

    var keyPair = pushLib.getKeyPair();

    var params = {
        locale: req.params.locale || "en",
        countryIsoCode: countryIsoCode,
        user: userObj && JSON.stringify(userObj),
        content: req.mode === "edit" && portalLib.getContent(),
        siteUrl: baseHref === "/" ? "" : baseHref,
        baseHref: baseHref + "/", // trailing slash for relative urls to be correct
        assetsUrl: baseHref + "/assets",
        audioUrl: baseHref + "/assets/audio/",
        loginUrl: portalLib.loginUrl({ redirect: baseHref }),
        logoutUrl: portalLib.logoutUrl({ redirect: baseAbsoluteUrl, type: "absolute" }),
        logoutMarketingUrl: portalLib.url({ path: '/', type: 'absolute'}),
        idProvider: portalLib.idProviderUrl(),
        setImageUrl: portalLib.serviceUrl({ service: "set-image" }),
        liveGameUrl: getWebSocketUrl(
            portalLib.serviceUrl({ service: "live-game", type: "absolute" })
        ),
        publicKey: keyPair.publicKey,
    };
    var body = mustacheLib.render(view, params);

    return {
        contentType: "text/html",
        body: body,
    };
};

var isPlayerCreatePage = function (req, appBaseUrl) {
    return endsWith(req.path, appBaseUrl + "/player-create");
};

var mustLogIn = function (req) {
    return (
        !authLib.getUser() &&
        (req.path.search(/\/app$/) !== -1 ||
            req.path.search(/\/app\/player-create$/) !== -1)
    );
};

var hasLoginSuggestParam = function (req) {
    return req.params.login;
};

var getPlayer = function () {
    var user = authLib.getUser();
    return user && storeLib.getPlayerByUserKey(user.key);
};

var isLoggedInUserWithoutPlayer = function () {
    var user = authLib.getUser();
    if (!user) {
        return false;
    }
    return !storeLib.getPlayerByUserKey(user.key);
};

var endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getWebSocketUrl = function (url) {
    var wsProto = url.indexOf("https:") === 0 ? "wss" : "ws";
    return wsProto + url.substring(url.indexOf(":"));
};
