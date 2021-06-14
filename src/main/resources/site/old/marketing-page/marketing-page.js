var authLib = require('/lib/xp/auth');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');
var view = resolve('./marketing-page.html');

exports.get = function (req) {
    
    //In live mode, if the user is authenticated, redirect him to the app
    var site = portal.getSite();
    if (req.mode === 'live' && authLib.getUser()) {
        return {
            redirect: portal.pageUrl({
                path: site._path + '/app',
                type: 'absolute'
            })
        };
    }

    var content = portal.getContent();
    var appContent = contentLib.query({
        start: 0,
        count: 1,
        contentTypes: [
            app.name + ":app"
        ]
    });
    var appUrl = appContent.count === 0 ? '#' : portal.pageUrl({id: appContent.hits[0]._id});    
    var siteUrl = portal.pageUrl({
        path: site._path
    });
    var params = {
        page: content.page,
        appUrl: appUrl,
        isLive: (req.mode == 'live'),
        siteUrl: (siteUrl == '/') ? '' : siteUrl
    };
    var body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
};
