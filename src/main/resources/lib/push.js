
exports.send = function (endpoint, userPublicKey, userAuth) {
    var pushBean = __.newBean('com.enonic.app.officeleague.push.PushBean');
    pushBean.endpoint = endpoint;
    pushBean.userPublicKey = userPublicKey;
    pushBean.userAuth = userAuth;
    
    pushBean.send('Test');
};