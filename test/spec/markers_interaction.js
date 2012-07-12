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
});
