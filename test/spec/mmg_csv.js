describe('mmg csv', function() {
    it('can parse a simple csv file', function() {
        var csv = 'lat,lon\n10,15';
        expect(mmg_csv(csv)[0].geometry.coordinates).toEqual([15, 10]);
    });
});
