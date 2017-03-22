exports.toArray = function (object) {
    if (!object) {
        return [];
    }
    if (object.constructor === Array) {
        return object;
    }
    return [object];
};

exports.toInt = function (number, defaultValue) {
    return number == null ? defaultValue.intValue() : number.intValue();
};