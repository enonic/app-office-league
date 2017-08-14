var encodingLib = require('/lib/text-encoding');
var httpClient = require('/lib/xp/http-client');

/**
 * Generate a Gravatar URL for a given email.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.email Email to retrieve the gravatar from.
 * @param {string} [params.ifNotFound='404'] Default if email not found: '404', 'mm', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'.
 * @param {number} [params.size=80] Image size in pixels.
 *
 * @returns {string} Gravatar URL.
 */
exports.gravatarUrl = function (params) {
    params.email = params.email.toLowerCase();
    params.ifNotFound = params.ifNotFound || '404';
    var hash = encodingLib.md5(params.email).toLowerCase();
    var urlParams = '';
    if (params.size != null) {
        urlParams = 's=' + params.size;
    }
    if (params.ifNotFound != null) {
        urlParams = urlParams + (urlParams ? '&' : '') + 'd=' + params.ifNotFound;
    }
    return 'https://www.gravatar.com/avatar/' + hash + (urlParams ? '?' + urlParams : '');
};

/**
 * Retrieve a Gravatar image for a given email.
 *
 * @param {object} params JSON parameters.
 * @param {string} params.email Email to retrieve the gravatar from.
 * @param {string} [params.ifNotFound='404'] Default if email not found: '404', 'mm', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'.
 * @param {number} [params.size=80] Image size in pixels.
 *
 * @returns {Object} Gravatar image.
 */
exports.fetchGravatarImage = function (params) {
    var url = exports.gravatarUrl(params);
    var response = httpClient.request({
        url: url,
        method: 'GET'
    });

    if (response.status !== 200) {
        return null;
    }

    return {
        body: response.bodyStream,
        contentType: response.contentType
    }
};