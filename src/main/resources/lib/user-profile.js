var gravatarLib = require('/lib/gravatar');
var authLib = require('/lib/xp/auth');
var httpClient = require('/lib/http-client');
var nodeLib = require('/lib/xp/node');
var valueLib = require('/lib/xp/value');
var imageLib = require('/lib/image');
var contextLib = require('/lib/xp/context');

exports.getUserProfileImage = function (userKey) {
    var user = authLib.getPrincipal(userKey);
    if (!user) {
        return null;
    }

    var email = user && user.email;
    if (email) {
        var gravatarImg = gravatarLib.fetchGravatarImage({email: email, ifNotFound: '404', size: 128});
        if (gravatarImg) {
            return {
                body: resizeImage(gravatarImg.body, gravatarImg.contentType),
                contentType: gravatarImg.contentType
            }
        }
    }

    var auth0Profile = authLib.getProfile({key: userKey, scope: 'auth0Identities'});
    var profilePicture = auth0Profile && auth0Profile.picture;
    if (profilePicture) {
        var profileImage = fetchImage(profilePicture);
        if (profileImage) {
            return {
                body: resizeImage(profileImage.body, profileImage.contentType),
                contentType: profileImage.contentType
            }
        }
    }

    return null;
};

var resizeImage = function (imageStream, contentType) {

    return contextLib.run({
        repository: 'office-league',
        branch: 'master',
        user: {
            login: 'su',
            userStore: 'system'
        }
    }, function () {
        var repoConn = nodeLib.connect({
            repoId: 'office-league',
            branch: 'master'
        });

        var bin = valueLib.binary('tmp', imageStream);
        var tmpNode = repoConn.create({
            attachment: {
                name: 'tmp',
                binary: bin,
                mimeType: contentType,
                label: 'label',
                size: imageStream.size()
            }
        });

        var size = 128;
        var img = imageLib.processImage({
            id: tmpNode._id,
            name: 'tmp',
            scale: 'square(' + size + ')',
            background: 'ffffff',
            mimeType: contentType
        });
        repoConn.delete(tmpNode._id);
        return img;
    });

};

var fetchImage = function (url) {
    var response;
    try {
        response = httpClient.request({
            url: url,
            method: 'GET'
        });
    } catch (e) {
        return null;
    }

    if (response.status !== 200) {
        return null;
    }

    return {
        body: response.bodyStream,
        contentType: response.contentType
    }
};