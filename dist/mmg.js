function mmg() {

    var m = {},
        // external list of geojson features
        features = [],
        // internal list of markers
        markers = [],
        // internal list of callbacks
        callbackManager = new MM.CallbackManager(m, ['drawn', 'markeradded']),
        // the absolute position of the parent element
        position = null,
        // a factory function for creating DOM elements out of
        // GeoJSON objects
        factory = null,
        // a sorter function for sorting GeoJSON objects
        // in the DOM
        sorter = null,
        // a list of urls from which features can be loaded.
        // these can be templated with {z}, {x}, and {y}
        urls,
        // map bounds
        left = null,
        right = null;

    // The parent DOM element
    var parent = document.createElement('div');
    parent.style.cssText = 'position: absolute; top: 0px;' +
        'left: 0px; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 0';
    m.parent = parent;

    // reposition a single marker element
    function reposition(marker) {
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
        MM.moveElement(marker.element, pos);
    }

    // Adding and removing callbacks is mainly a way to enable mmg_interaction to operate.
    // I think there are better ways to do this, by, for instance, having mmg be able to
    // register 'binders' to markers, but this is backwards-compatible and equivalent
    // externally.
    m.addCallback = function(event, callback) {
        callbackManager.addCallback(event, callback);
        return m;
    };

    m.removeCallback = function(event, callback) {
        callbackManager.removeCallback(event, callback);
        return m;
    };

    m.draw = function() {
        if (!m.map) return;
        left = m.map.pointLocation(new MM.Point(0, 0));
        right = m.map.pointLocation(new MM.Point(m.map.dimensions.x, 0));
        callbackManager.dispatchCallback('drawn', m);
        for (var i = 0; i < markers.length; i++) {
            reposition(markers[i]);
        }
    };

    m.add = function(marker) {
        if (!marker || !marker.element) return null;
        parent.appendChild(marker.element);
        markers.push(marker);
        callbackManager.dispatchCallback('markeradded', marker);
        return marker;
    };

    m.remove = function(marker) {
        if (!marker) return null;
        parent.removeChild(marker.element);
        for (var i = 0; i < markers.length; i++) {
            if (markers[i] === marker) {
                markers.splice(i, 1);
                return marker;
            }
        }
        return marker;
    };

    m.markers = function(x) {
        if (!arguments.length) return markers;
    };

    m.add_feature = function(x) {
        return m.features(m.features().concat([x]));
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

        // clear markers representation
        markers = [];
        // Set features
        if (!x) x = [];
        features = x.slice();

        features.sort(sorter);

        for (var i = 0; i < features.length; i++) {
            m.add({
                element: factory(features[i]),
                location: new MM.Location(features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]),
                data: features[i]
            });
        }

        if (m.map && m.map.coordinate) m.map.draw();

        return m;
    };

    m.url = function(x, callback) {
        if (!arguments.length) return urls;
        if (typeof reqwest === 'undefined') throw 'reqwest is required for url loading';
        if (typeof x === 'string') x = [x];

        urls = x;
        function add_features(x) {
            if (x && x.features) m.features(x.features);
            if (callback) callback(x.features, m);
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

    m.extent = function() {
        var ext = [{ lat: Infinity, lon: Infinity}, { lat: -Infinity, lon: -Infinity }];
        var ft = m.features();
        for (var i = 0; i < ft.length; i++) {
            var coords = ft[i].geometry.coordinates;
            if (coords[0] < ext[0].lon) ext[0].lon = coords[0];
            if (coords[1] < ext[0].lat) ext[0].lat = coords[1];
            if (coords[0] > ext[1].lon) ext[1].lon = coords[0];
            if (coords[1] > ext[1].lat) ext[1].lat = coords[1];
        }
        return ext;
    };

    // Factory interface
    m.factory = function(x) {
        if (!arguments.length) return factory;
        factory = x;
        
        // re-render all features
        m.features(m.features());
        return m;
    };
    m.factory(function defaultFactory(feature) {
        var d = document.createElement('div');
        d.className = 'mmg-default';
        d.style.position = 'absolute';
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

    m.destroy = function() {
        if (this.parent.parentNode) {
          this.parent.parentNode.removeChild(this.parent);
        }
    };

    return m;
}
function mmg_interaction(mmg) {

    var mi = {},
        tooltips = [],
        exclusive = true,
        hide_on_move = true,
        show_on_hover = true,
        close_timer = null,
        formatter;

    mi.formatter = function(x) {
        if (!arguments.length) return formatter;
        formatter = x;
        return mi;
    };
    mi.formatter(function(feature) {
        var o = '',
            props = feature.properties;

        // Tolerate markers without properties at all.
        if (!props) return null;

        if (props.title) {
            o += '<div class="mmg-title">' + props.title + '</div>';
        }
        if (props.description) {
            o += '<div class="mmg-description">' + props.description + '</div>';
        }

        if (typeof html_sanitize !== undefined) {
            o = html_sanitize(o,
                function(url) {
                    if (/^(https?:\/\/|data:image)/.test(url)) return url;
                },
                function(x) { return x; });
        }

        return o;
    });

    mi.hide_on_move = function(x) {
        if (!arguments.length) return hide_on_move;
        hide_on_move = x;
        return mi;
    };

    mi.exclusive = function(x) {
        if (!arguments.length) return exclusive;
        exclusive = x;
        return mi;
    };

    mi.show_on_hover = function(x) {
        if (!arguments.length) return show_on_hover;
        show_on_hover = x;
        return mi;
    };

    mi.hide_tooltips = function() {
        while (tooltips.length) mmg.remove(tooltips.pop());
        for (var i = 0; i < markers.length; i++) {
            delete markers[i].clicked;
        }
    };

    mi.bind_marker = function(marker) {
        var delayed_close = function() {
            if (!marker.clicked) close_timer = window.setTimeout(function() {
                mi.hide_tooltips();
            }, 200);
        };

        var show = function(e) {
            var content = formatter(marker.data);
            // Don't show a popup if the formatter returns an
            // empty string. This does not do any magic around DOM elements.
            if (!content) return;

            if (exclusive && tooltips.length > 0) {
                mi.hide_tooltips();
                // We've hidden all of the tooltips, so let's not close
                // the one that we're creating as soon as it is created.
                if (close_timer) window.clearTimeout(close_timer);
            }

            var tooltip = document.createElement('div');
            tooltip.className = 'wax-movetip';
            tooltip.style.width = '100%';

            var wrapper = tooltip.appendChild(document.createElement('div'));
            wrapper.style.cssText = 'position: absolute; pointer-events: none;';

            var intip = wrapper.appendChild(document.createElement('div'));
            intip.className = 'wax-intip';
            intip.style.cssText = 'pointer-events: auto;';

            if (typeof content == 'string') {
                intip.innerHTML = content;
            } else {
                intip.appendChild(content);
            }

            // Align the bottom of the tooltip with the top of its marker
            wrapper.style.bottom = marker.element.offsetHeight / 2 + 20 + 'px';

            if (show_on_hover) {
                tooltip.onmouseover = function() {
                    if (close_timer) window.clearTimeout(close_timer);
                };
                tooltip.onmouseout = delayed_close;
            }

            var t = {
                element: tooltip,
                data: {},
                interactive: false,
                location: marker.location.copy()
            };
            tooltips.push(t);
            mmg.add(t);
            mmg.draw();
        };

        marker.element.onclick = marker.element.ontouchstart = function() {
            show();
            marker.clicked = true;
        };

        if (show_on_hover) {
            marker.element.onmouseover = show;
            marker.element.onmouseout = delayed_close;
        }
    };

    function bindPanned() {
        mmg.map.addCallback('panned', function() {
            if (hide_on_move) {
                while (tooltips.length) {
                    mmg.remove(tooltips.pop());
                }
            }
        });
    }

    if (mmg) {
        // Remove tooltips on panning
        mmg.addCallback('drawn', bindPanned);
        mmg.removeCallback('drawn', bindPanned);

        // Bind present markers
        var markers = mmg.markers();
        for (var i = 0; i < markers.length; i++) {
            mi.bind_marker(markers[i]);
        }

        // Bind future markers
        mmg.addCallback('markeradded', function(_, marker) {
            // Markers can choose to be not-interactive. The main example
            // of this currently is marker bubbles, which should not recursively
            // give marker bubbles.
            if (marker.interactive !== false) mi.bind_marker(marker);
        });
    }

    return mi;
}
function simplestyle_factory(feature) {

    var sizes = {
      small: [20, 50],
      medium: [30, 70],
      large: [35, 90]
    };

    var fp = feature.properties || {};

    var size = fp['marker-size'] || 'medium';
    var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
    var color = fp['marker-color'] || '7e7e7e';
    color = color.replace('#', '');

    var d = document.createElement('img');
    d.width = sizes[size][0];
    d.height = sizes[size][1];
    d.className = 'simplestyle-marker';
    d.alt = fp.title || '';
    d.src = (simplestyle_factory.baseurl || 'http://a.tiles.mapbox.com/v3/marker/') +
      'pin-' + size[0] + symbol + '+' + color + '.png';

    var ds = d.style;
    ds.position = 'absolute';
    ds.clip = 'rect(auto auto ' + (sizes[size][1] * 0.75) + 'px auto)';
    ds.marginTop = -((sizes[size][1]) / 2) + 'px';
    ds.marginLeft = -(sizes[size][0] / 2) + 'px';
    ds.cursor = 'pointer';

    return d;
}
