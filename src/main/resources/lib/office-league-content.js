var contentLib = require('/lib/xp/content');

exports.getContent = function (key) {
    var content = contentLib.get({key: key});
    return checkPath(content) ? content: null;
};

exports.getChildren = function (params) {
    var getChildrenResult = contentLib.getChildren(params);
    return getChildrenResult.hits.filter(checkPath);
};

exports.query = function (params) {
    var queryResult = contentLib.query(params);
    return queryResult.hits.filter(checkPath);
};

function checkPath(content) {
    return content && content._path.indexOf('/office-league/app/') == 0;
}