var imageLib = require('/lib/image');
var assert = require('/lib/xp/testing');

exports.testProcessImageRequiredParams = function () {
    var result = imageLib.processImage({
        id: '123',
        name: 'logo.png',
        scale: 'width(100)',
        mimeType: 'image/png'
    });
    assert.assertNotNull(result);
};

exports.testProcessImageAllParams = function () {
    var result = imageLib.processImage({
        id: '123',
        name: 'logo.png',
        scale: 'block(100,100)',
        mimeType: 'image/jpeg',
        quality: 90,
        background: '0xAABBCC',
        filter: 'grayscale()',
        orientation: 6
    });
    assert.assertNotNull(result);
};
