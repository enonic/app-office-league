var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/thymeleaf')
};

var view = resolve('video.html');

exports.get = function (req) {
    var component = libs.portal.getComponent();

    var videos = [].concat(component.config.video);
    var v, videoFile;
    var videoUrls = [], videoTypes = [];
    for (v = 0; v < videos.length; v++) {
        videoFile = videos[v];
        if (!videoFile) {
            continue;
        }
        videoUrls.push(libs.portal.attachmentUrl({name: videoFile}));
        videoTypes.push(mimeTypeFromFileName(videoFile));
    }
    var model = {
        title: component.config.title,
        buttonText: component.config.buttonText,
        videoUrls: videoUrls,
        videoTypes: videoTypes
    };

    return {
        body: libs.thymeleaf.render(view, model)
    };
};

var mimeTypeFromFileName = function (fileName) {
    var ext = fileName.indexOf('.') > 0 ? fileName.split('.').pop().toLowerCase() : '';

    var mimeType = '';
    if (ext.indexOf('mp4') > -1) {
        mimeType = 'video/mp4';

    } else if (ext.indexOf('ogv') > -1) {
        mimeType = 'video/ogg';

    } else if (ext.indexOf('webm') > -1) {
        mimeType = 'video/webm';
    }
    return mimeType;
};
