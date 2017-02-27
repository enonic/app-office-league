/**
 * @file Node attachment helpers.
 */

/**
 * Returns the HTTP response with the contents of a binary attachment.
 * Sets content-type header according to content attachment.
 * Sets ETag, allowing clients to save bandwidth by checking for resource freshness with 'If-None-Match' header.
 *
 * @param {Object} httpRequest HTTP request object from a controller.
 * @param {RepoConnection} repoConn Repository connection object.
 * @param {Object} node Node object.
 * @param {string} attachmentName Name of the attachment.
 * @param {Function} [notFoundHandler] Function to be called in case the attachment was not found, used to provide default content.
 * @param {Function} [processHandler] Function to be called for processing stream. Takes node and attachment objects as parameter, should return a new stream.
 * @returns {Object} HTTP response object.
 */
exports.serveAttachment = function (httpRequest, repoConn, node, attachmentName, notFoundHandler, processHandler) {
    notFoundHandler = notFoundHandler || notFound;

    var attachment = findAttachment(node, attachmentName);
    if (!attachment) {
        return notFoundHandler();
    }
    var ifNoneMatch = httpRequest.headers['If-None-Match'];
    if (ifNoneMatch === node._versionKey) {
        return notModified(attachment.mimeType);
    }

    var binaryStream = repoConn.getBinary({
        key: node._id,
        binaryReference: attachment.binary
    });
    if (!binaryStream) {
        return notFoundHandler();
    }

    if (processHandler) {
        binaryStream = processHandler(node, attachment, httpRequest.params) || binaryStream;
    }

    return {
        contentType: attachment.mimeType,
        body: binaryStream,
        headers: {
            ETag: node._versionKey
        }
    }
};

var findAttachment = function (node, attachmentName) {
    var attachments = [].concat(node.attachment || []);
    var i, att;
    for (i = 0; i < attachments.length; i++) {
        att = attachments[i];
        if (att.name === attachmentName) {
            break;
        }
    }
    return att;
};

var notFound = function () {
    return {
        status: 404
    }
};

var notModified = function (mimeType) {
    return {
        status: 304,
        contentType: mimeType
    }
};
