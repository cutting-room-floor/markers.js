function tooltip_wrap() {
    var tw = {},
        map,
        tooltip,
        loc,
        formatter;

    tw.factory = function(x) {
        if (!arguments.length) return factory;
        factory = x;
        return tw;
    };

    tw.tooltip = function(x) {
        if (!arguments.length) return tooltip;
        tooltip = x;
        return tw;
    };

    tw.map = function(x) {
        if (!arguments.length) return map;
        map = x;
        if (map.addCallback) {
            map.addCallback('drawn', function() {
                tooltip.anchor(map.locationPoint(loc));
                tooltip.move();
            });
        }
        return tw;
    };

    tw.formatter = function(x) {
        if (!arguments.length) return formatter;
        formatter = x;
        return tw;
    };
    tw.formatter(function(feature) {
        var o = '';
        if (feature.properties.title) {
          o += '<h2>' + feature.properties.title + '</h2>';
        }
        if (feature.properties.description) {
          o += feature.properties.description;
        }
        return o;
    });

    tw.wrapped_factory = function() {
        return function(feature) {
            var elem = factory(feature);
            elem.onclick = function(e) {
                loc = new MM.Location(
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0]);
                tooltip.events().on({
                    e: e,
                    content: formatter(feature)
                });
                tooltip.offset({
                    x: (tooltip.element().offsetWidth / 2),
                    y: (tooltip.element().offsetHeight) + (elem.offsetHeight / 2) + 10
                });
            };
            elem.onmouseout = function(e) {
                tooltip.events().off({
                    e: e,
                    content: formatter(feature)
                });
            };
            return elem;
        };
    };

    return tw;
}
