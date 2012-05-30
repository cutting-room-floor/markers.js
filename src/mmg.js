function mmg() {

    var m = {},
        // external list of geojson features
        features = [],
        // internal list of markers
        markers = [],
        // the absolute position of the parent element
        position = null,
        // a factory function for creating DOM elements out of
        // GeoJSON objects
        factory = null,
        // a sorter function for sorting GeoJSON objects
        // in the DOM
        sorter = null,
        // map bounds
        left = null,
        // a list of urls from which features can be loaded.
        // these can be templated with {z}, {x}, and {y}
        urls,
        right = null;

    // reposition a single marker element
    function repositionMarker(marker) {
        // remember the tile coordinate so we don't have to reproject every time
        if (!marker.coord) marker.coord = m.map.locationCoordinate(marker.location);
        var pos = m.map.coordinatePoint(marker.coord);
        var pos_loc;

        // If this point has wound around the world, adjust its position
        // to the new, onscreen location
        if (pos.x < 0) {
            pos_loc = new MM.Location(marker.location.lat, marker.location.lon);
            pos_loc.lon += Math.ceil((left.lon - marker.location.lon) / 360) * 360;
            pos = m.map.locationPoint(pos_loc);
            marker.coord = m.map.locationCoordinate(pos_loc);
        } else if (pos.x > m.map.dimensions.x) {
            pos_loc = new MM.Location(marker.location.lat, marker.location.lon);
            pos_loc.lon -= Math.ceil((marker.location.lon - right.lon) / 360) * 360;
            pos = m.map.locationPoint(pos_loc);
            marker.coord = m.map.locationCoordinate(pos_loc);
        }

        pos.scale = 1;
        pos.width = pos.height = 0;
        MM.moveElement(marker, pos);
    }

    m.draw = function() {
        left = m.map.pointLocation(new MM.Point(0, 0));
        right = m.map.pointLocation(new MM.Point(m.map.dimensions.x, 0));
        for (var i = 0; i < markers.length; i++) {
            repositionMarker(markers[i]);
        }
    };

    m.addMarker = function(marker, feature) {
        if (!marker || !feature) return null;
        // convert the feature to a Location instance
        marker.location = new MM.Location(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        // position: absolute
        marker.style.position = 'absolute';
        // update the marker's position
        if (m.map) repositionMarker(marker);
        // append it to the DOM
        parent.appendChild(marker);
        // add it to the list
        markers.push(marker);
        return marker;
    };

    // Public data interface
    m.features = function(x) {
        // Return features
        if (!arguments.length) return features;

        // Clear features
        while (parent.hasChildNodes()) {
            // removing lastChild iteratively is faster than
            // innerHTML = ''
            // http://jsperf.com/innerhtml-vs-removechild-yo/2
            parent.removeChild(parent.lastChild);
        }

        // Set features
        if (!x) x = [];
        features = x;

        features.sort(sorter);

        for (var i = 0; i < x.length; i++) {
            m.addMarker(factory(x[i]), x[i]);
        }

        return m;
    };

    m.url = function(x, callback) {
        if (typeof reqwest === 'undefined') throw 'reqwest is required for url loading';
        if (typeof x === 'string') {
          urls = [x];
        } else {
          urls = x;
        }

        function add_features(x) {
            if (x && x.features) m.features(x.features);
            if (callback) callback(x.features);
        }

        reqwest((urls[0].match(/geojsonp$/)) ? {
            url: urls[0] + (~urls[0].indexOf('?') ? '&' : '?') + 'callback=grid',
            type: 'jsonp',
            jsonpCallback: 'callback',
            success: add_features,
            error: add_features
        } : {
            url: urls[0],
            type: 'json',
            success: add_features,
            error: add_features
        });
        return m;
    };

    // Factory interface
    m.factory = function(x) {
        if (!arguments.length) return factory;
        factory = x;
        return m;
    };
    m.factory(function defaultFactory(feature) {
        var d = document.createElement('div');
        d.className = 'mmg-default';
        return d;
    });

    m.sort = function(x) {
        if (!arguments.length) return sorter;
        sorter = x;
        return m;
    };
    m.sort(function(a, b) {
        return b.geometry.coordinates[1] -
          a.geometry.coordinates[1];
    });

    // The parent DOM element
    var parent = document.createElement('div');
    parent.style.cssText = 'position: absolute; top: 0px;' +
        'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 0';
    m.parent = parent;

    return m;
}
