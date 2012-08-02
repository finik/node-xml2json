module.exports = function toXml(json, xml, flags) {
    var xml = xml || '';
    if (json instanceof Buffer) {
        json = json.toString();
    }

    var obj = null;
    if (typeof(json) == 'string') {
        try {
            obj = JSON.parse(json);
        } catch(e) {
            throw new Error("The JSON structure is invalid");
        }
    } else {
        obj = json;
    }

    var keys = Object.keys(obj);
    var len = keys.length;
    var localFlags = {};

    // First pass, extract strings only
    for (var i = 0; i < len; i++) {
        var key = keys[i];
        if (typeof(obj[key]) == 'string') {
            if (key == '$t') {
                xml += obj[key];
            } else {
                xml = xml.replace(/>$/, '');
                xml += ' ' + key + "='" + obj[key] + "'>";
            }
        }
    }

    // Second path, now handle sub-objects and arrays
    for (var i = 0; i < len; i++) {
        var key = keys[i];

        if (Array.isArray(obj[key])) {
            if (flags) {
                flags.closeTag = true;
            }

            var elems = obj[key];
            var l = elems.length;
            for (var j = 0; j < l; j++) {
                xml += '<' + key + '>';
                localFlags.closeTag = false;
                xml = toXml(elems[j], xml, localFlags);
                if (localFlags.closeTag) {
                    xml += '</' + key + '>';
                } else {
                    xml = xml.replace(/>$/, ' />');
                }
            }
        } else if (typeof(obj[key]) == 'object') {
            if (flags) {
                flags.closeTag = true;
            }

            xml += '<' + key + '>';
            localFlags.closeTag = false;
            xml = toXml(obj[key], xml, localFlags);
            if (localFlags.closeTag) {
                xml += '</' + key + '>';
            } else {
                xml = xml.replace(/>$/, ' />');
            }
        }
    }

    return xml;
};

