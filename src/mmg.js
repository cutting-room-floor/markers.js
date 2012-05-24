function mmg() {

    var mmg = {},
        // a list of our markers
        geojson_features = [],
        // the absolute position of the parent element
        position = null,
        factory = null,
        // map bounds
        left = null,
        right = null;

    // Reposition al markers
    function repositionAllMarkers() {
        left = l.map.pointLocation(new MM.Point(0, 0));
        right = l.map.pointLocation(new MM.Point(l.map.dimensions.x, 0));
        for (var i = 0; i < markers.length; i++) {
            repositionMarker(markers[i]);
        }
    }

    // reposition a single marker element
    function repositionMarker(marker) {
        // remember the tile coordinate so we don't have to reproject every time
        if (!marker.coord) marker.coord = l.map.locationCoordinate(marker.location);
        var pos = l.map.coordinatePoint(marker.coord);
        var pos_loc;
        if (pos.x < 0) {
            pos_loc = new MM.Location(marker.location.lat, marker.location.lon);
            pos_loc.lon += Math.ceil((left.lon - marker.location.lon) / 360) * 360;
            pos = l.map.locationPoint(pos_loc);
        } else if (pos.x > l.map.dimensions.x) {
            pos_loc = new MM.Location(marker.location.lat, marker.location.lon);
            pos_loc.lon -= Math.ceil((marker.location.lon - right.lon) / 360) * 360;
            pos = l.map.locationPoint(pos_loc);
        }
        if (pos_loc) {
            marker.coord = l.map.locationCoordinate(pos_loc);
        }
        pos.scale = 1;
        pos.width = pos.height = 0;
        MM.moveElement(marker, pos);
    }

    mmg.addMarker = function(marker, feature) {
        if (!marker || !feature) {
            return null;
        }
        // convert the feature to a Location instance
        marker.location = new MM.Location(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        // position: absolute
        marker.style.position = 'absolute';
        // update the marker's position
        if (l.map) repositionMarker(marker);
        // append it to the DOM
        parent.appendChild(marker);

        // add it to the list
        markers.push(marker);

        return marker;
    };

    mmg.geojson = function(x) {
        // Return features
        if (!arguments.length) {
            return {
                type: 'FeatureCollection',
                features: geojson_features
            };
        }

        // Clear features
        // removing lastChild iteratively is faster than
        // innerHTML = ''
        // http://jsperf.com/innerhtml-vs-removechild-yo/2
        while (parent.hasChildNodes()) {
            parent.removeChild(parent.lastChild);
        }
        geojson_features = [];

        // Set features
        if (x && x.features) {
            for (var i = 0; i < x.features.length; i++) {
                l.addMarker(factory(x.features[i]), x.features[i]);
            }
        }

        return mmg;
    };

    mmg.draw = function() {
        repositionAllMarkers();
    };

    mmg.factory = function(x) {
        if (!x) return factory;
        factory = x;
        return mmg;
    };

    var parent = document.createElement('div');
    parent.style.cssText = 'position: absolute; top: 0px;' +
        'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 0';

    mmg.parent = parent;

    mmg.factory(function defaultFactory(feature) {
        var d = document.createElement('div');
        d.className = 'mmg-default';
        return d;
    });

    return mmg;
}
