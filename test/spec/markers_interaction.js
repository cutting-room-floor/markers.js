describe('mapbox.markers interaction', function() {
    it('can format a feature', function() {
        var mi = mapbox.markers.interaction();
        var output = mi.formatter()({
            properties: {
                title: 'test',
                description: 'cats'
            }
        });
        expect(output).toEqual('<div class="marker-title">test</div><div class="marker-description">cats</div>');
    });

    it('can get and set a formatter', function() {
        var fred = function() {};
        var mi = mapbox.markers.interaction();
        mi.formatter(fred);
        expect(mi.formatter()).toEqual(fred);
    });

    it('can be attached to a markers layer', function() {
        var m = mapbox.markers.layer();
        var mi = mapbox.markers.interaction(m);
    });

    it('can be enabled and disabled', function() {
        var m = mapbox.markers.layer();
        var mi = mapbox.markers.interaction(m);
        expect(mi.add()).toEqual(mi);
        expect(mi.remove()).toEqual(mi);
    });

    it('can hide all tooltips', function() {
        var m = mapbox.markers.layer();
        var mi = mapbox.markers.interaction(m);
        expect(mi.hideTooltips()).toEqual(mi);
    });

    it('binds a marker', function() {
        var m = mapbox.markers.layer().features([{
            geometry: { coordinates: [0, 0] },
            properties: { title: 'Foo' }
        }]);

        expect(m.markers()[0].showTooltip).toBeFalsy();
        var mi = mapbox.markers.interaction(m);
        expect(m.markers()[0].showTooltip).toBeTruthy();

        expect(m.markers()[0].tooltip).toBeFalsy();
        expect(m.markers().length).toEqual(1);
        m.markers()[0].showTooltip();
        expect(m.markers()[0].tooltip).toBeTruthy();
        expect(m.markers().length).toEqual(2);

        mi.hideTooltips();
        expect(m.markers().length).toEqual(1);
    });

    it('does not mess with `key`ed features', function () {
        var m = mapbox.markers.layer();
        var mi = mapbox.markers.interaction(m);
        // this would throw if it would be called with a tooltips empty `data`
        m.key(function (f) { return f.properties.title; });

        function check() {
            m.features([{
                geometry: { coordinates: [0, 0] },
                properties: { title: 'Foo' }
            }]);
            expect(m.markers().length).toEqual(1);
            m.markers()[0].showTooltip();
            expect(m.markers().length).toEqual(2);
        }
        check();
        // TODO: automatically removing the tooltip when a marker is removed
        // is not yet possible, so clear the tooltips manually
        mi.hideTooltips();
        m.features([]);
        expect(m.markers().length).toEqual(0);
        check();
    });

    it('multiple interactions will not attach, only the first', function() {
        var m = mapbox.markers.layer();
        var a = mapbox.markers.interaction(m);
        var b = mapbox.markers.interaction(m);
        var c = mapbox.markers.interaction(m);
        expect(m.interaction).toEqual(a);
    });

    it('sets a reference to itself when attached to a markers layer', function() {
        var m = mapbox.markers.layer();
        var mi = mapbox.markers.interaction(m);
        expect(m.interaction).toEqual(mi);
    });
});
