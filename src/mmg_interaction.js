function mmg_interaction(mmg) {

    var mi = {},
        tooltips = [],
        exclusive = true,
        hide_on_move = true,
        formatter;

    mi.formatter = function(x) {
        if (!arguments.length) return formatter;
        formatter = x;
        return mi;
    };
    mi.formatter(function(feature) {
        var o = '',
            props = feature.properties;
        if (props.title) {
          o += '<strong>' + props.title + '</strong><br />';
        }
        if (props.description) {
          o += props.description;
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

    mi.bind_marker = function(marker) {
        marker.element.onclick = function(e) {
            if (exclusive && tooltips.length > 0) {
                mmg.remove(tooltips.pop());
            }

            var tooltip = document.createElement('div');
            tooltip.className = 'wax-movetip';

            var intip = tooltip.appendChild(document.createElement('div'));
            intip.className = 'wax-intip';
            var content = formatter(marker.data);
            if (typeof content == 'string') {
                intip.innerHTML = content;
            } else {
                intip.appendChild(content);
            }

            // Here we're adding the tooltip to the dom briefly
            // to gauge its size. There should be a better way to do this.
            document.body.appendChild(tooltip);
            intip.style.marginTop = -(
                (marker.element.offsetHeight * 0.5) +
                tooltip.offsetHeight + 10) + 'px';
            document.body.removeChild(tooltip);

            var t = {
                element: tooltip,
                data: {},
                location: marker.location.copy()
            };
            tooltips.push(t);
            mmg.add(t);
            mmg.draw();
        };
    };

    if (mmg && mmg.map) {
        mmg.map.addCallback('panned', function() {
            if (hide_on_move) {
                while (tooltips.length) {
                    mmg.remove(tooltips.pop());
                }
            }
        });
        var markers = mmg.markers();
        for (var i = 0; i < markers.length; i++) {
            mi.bind_marker(markers[i]);
        }
    } else {
        if (console) console.log('mmg must be added to a map before interaction is assigned');
    }

    return mi;
}
