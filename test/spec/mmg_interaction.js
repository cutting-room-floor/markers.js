describe('mmg interaction', function() {
    it('can format a feature', function() {
        var mi = mmg_interaction();
        var output = mi.formatter()({
            properties: {
                title: 'test',
                description: 'cats'
            }
        });
        expect(output).toEqual('<div class="mmg-title">test</div><div class="mmg-description">cats</div>');
    });

    it('can get and set a formatter', function() {
        var fred = function() {};
        var mi = mmg_interaction();
        mi.formatter(fred);
        expect(mi.formatter()).toEqual(fred);
    });
});
