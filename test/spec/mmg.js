describe('mmg', function() {
  it('can be initialized', function() {
    var m = mmg();
  });

  it('returns its default factory function', function() {
    var m = mmg();
    expect(typeof m.factory()).toEqual('function');
  });

  it('can be assigned a new factory function', function() {
    var m = mmg();
    var foo = function() {};
    expect(typeof m.factory()).toEqual('function');
    expect(m.factory(foo)).toEqual(m);
    expect(m.factory()).toEqual(foo);
  });

  it('returns its empty features geojson', function() {
    var m = mmg();
    expect(m.geojson().type).toEqual('FeatureCollection');
    expect(m.geojson().features.length).toEqual(0);
  });
});
