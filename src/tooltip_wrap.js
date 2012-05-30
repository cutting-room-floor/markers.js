function tooltip_wrap(factory, tooltip, formatter) {
    formatter = formatter || function(feature) {
        var o = '';
        if (feature.properties.title) {
          o += '<h2>' + feature.properties.title + '</h2>';
        }
        if (feature.properties.description) {
          o += feature.properties.description;
        }
        return o;
    };
    return function(feature) {
        var elem = factory(feature);
        elem.onclick = function(e) {
            tooltip.on({
                e: e,
                content: formatter(feature)
            });
        };
        return elem;
    };
}
