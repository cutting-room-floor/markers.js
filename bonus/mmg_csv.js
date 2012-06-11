function mmg_csv(url, callback) {
    if (!arguments.length) return urls;
    if (typeof reqwest === 'undefined') throw 'reqwest is required for url loading';

    var log = (typeof console !== 'undefined') ? function(x) { console.log(x); } : function() {};

    function add_features(x) {
        var features = [];

        if (x.status >= 400) {
            if (typeof console != 'undefined') throw 'URL returned 404';
            return callback(features);
        }

        var parsed = csv_parse(x.responseText);
        if (!parsed.length) return callback(features);

        var latfield = '',
            lonfield = '';

        for (var f in parsed[0]) {
            if (f.match(/^Lat/i)) latfield = f;
            if (f.match(/^Lon/i)) lonfield = f;
        }

        for (var i = 0; i < parsed.length; i++) {
            if (parsed[i][lonfield] !== undefined &&
                parsed[i][lonfield] !== undefined) {
                features.push({
                    type: 'Feature',
                    properties: parsed[i],
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            parsed[i][lonfield],
                            parsed[i][latfield]]
                    }
                });
            } else {
                log('Some points did not contain lat/lon data');
                log(parsed[i]);
            }
        }

        if (callback) callback(features);
    }

    reqwest({
        url: url,
        type: 'string',
        success: add_features,
        error: add_features
    });
}
