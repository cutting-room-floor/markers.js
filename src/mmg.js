function mmg() {
    var l = {},
        // a list of our markers
        markers = null,
        // the absolute position of the parent element
        position = null,
        factory = null,
        // the last coordinate we saw on the map
        lastCoord = null;

    var parent = document.createElement('div');
    parent.style.cssText = 'position: absolute; top: 0px;' +
      'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 0';

    markers = [];
    resetPosition();

    function defaultFactory(feature) {
        var d = document.createElement('div');
        d.className = 'mmg-default';
        return d;
    }

    // when panned, offset the position by the provided screen coordinate x
    // and y values
    function onPanned (dx, dy) {
        position.x += dx;
        position.y += dy;
        parent.style.left = ~~(position.x + 0.5) + 'px';
        parent.style.top = ~~(position.y + 0.5) + 'px';
    }

    // when zoomed, reset the position and reposition all markers
    function onZoomed() {
        resetPosition();
        repositionAllMarkers();
    }

    function fLocation (feature) {
        // GeoJSON
        var geom = feature.geometry;
        // coerce the lat and lon values, just in case
        var lon = Number(geom.coordinates[0]),
            lat = Number(geom.coordinates[1]);
        return new MM.Location(lat, lon);
    }

    // Reposition al markers
    function repositionAllMarkers() {
        var len = markers.length;
        for (var i = 0; i < len; i++) {
            repositionMarker(markers[i]);
        }
    }

    // reposition a single marker element
    function repositionMarker(marker) {
        if (marker.coord) {
            var pos = l.map.coordinatePoint(marker.coord);
            // offset by the layer parent position if x or y is non-zero
            if (position.x || position.y) {
                pos.x -= position.x;
                pox.y -= position.y;
            }
            marker.style.left = ~~(pos.x + 0.5) + "px";
            marker.style.top = ~~(pos.y + 0.5) + "px";
        } else {
            // TODO: throw an error?
        }
    }

    /**
     * Add an HTML element as a marker, located at the position of the
     * provided GeoJSON feature, Location instance (or {lat,lon} object
     * literal), or "lat,lon" string.
     */
    l.addMarker = function(marker, feature) {
        if (!marker || !feature) {
            return null;
        }
        // convert the feature to a Location instance
        marker.location = fLocation(feature);
        // remember the tile coordinate so we don't have to reproject every time
        marker.coord = l.map.locationCoordinate(marker.location);
        // position: absolute
        marker.style.position = 'absolute';
        // update the marker's position
        repositionMarker(marker);
        // append it to the DOM
        parent.appendChild(marker);
        // add it to the list
        markers.push(marker);
        return marker;
    };

    l.geojson = function(x) {
        if (!x) return markers;

        for (var i = 0; i < x.features.length; i++) {
            l.addMarker(factory(x.features[i]), x.features[i]);
        }
        return this;
    };

    l.draw = function() {
        // these are our previous and next map center coordinates
        var prev = lastCoord,
            next = l.map.pointCoordinate({x: 0, y: 0});
        // if we've recorded the map's previous center...
        if (prev) {
            // if the zoom hasn't changed, find the delta in screen
            // coordinates and pan the parent element
            if (prev.zoom == next.zoom) {
                var p1 = l.map.coordinatePoint(prev),
                    p2 = l.map.coordinatePoint(next),
                    dx = p1.x - p2.x,
                    dy = p1.y - p2.y;
                onPanned(dx, dy);
            // otherwise, reposition all the markers
            } else {
                onZoomed();
            }
        // otherwise, reposition all the markers
        } else {
            onZoomed();
        }
        // remember the previous center
        _lastCoord = next.copy();
    };

    // reset the absolute position of the layer's parent element
    function resetPosition() {
        position = new MM.Point(0, 0);
        parent.style.left = parent.style.top = "0px";
    }

    /**
     * Remove the element marker from the layer and the DOM.
     */
    l.removeMarker = function(marker) {
        var index = markers.indexOf(marker);
        if (index > -1) {
            markers.splice(index, 1);
        }
        if (marker.parentNode == parent) {
            parent.removeChild(marker);
        }
        return marker;
    };

    // remove all markers
    l.removeAllMarkers = function() {
        while (markers.length > 0) {
            removeMarker(markers[0]);
        }
    };

    l.factory = function(x) {
      if (!x) return factory;
      factory = x;
      return this;
    };

    l.parent = parent;

    l.factory(defaultFactory);

    return l;
}
