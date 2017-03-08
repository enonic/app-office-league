exports.toArray = function(object) {
    if (!object) {
        return [];
    }
    if (object.constructor === Array) {
        return object;
    }
    return [object];
}

exports.toInt = function(number) {
    return number.intValue();
}