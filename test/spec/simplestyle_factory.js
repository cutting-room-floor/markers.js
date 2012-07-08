describe('simplestyle factory', function() {
    it('creates proper elements', function() {
        var ft = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-77, 37.8]
            },
            "properties": {
                "title": "This is a bus",
                "marker-shape": "pin",
                "marker-size": "medium",
                "marker-symbol": "bus",
                "marker-color": "#1ae"
            }
        };
        var elem = simplestyle_factory(ft);
        expect(jasmine.isDomNode(elem)).toBeTruthy();
    });
    it('does not fail when elements do not have style info', function() {
        var ft = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-77, 37.8]
            },
            "properties": {
                "title": "This is a bus"
            }
        };
        var elem = simplestyle_factory(ft);
        expect(jasmine.isDomNode(elem)).toBeTruthy();
    });
});
