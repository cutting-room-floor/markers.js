var Klass = function () {
};

Klass.prototype.callback = function (arg) {
  return arg;
};

describe('mmg', function() {
  it('can be initialized', function() {
    var m = mmg();
  });

  describe('factory', function() {
    it('returns its default factory function', function() {
      var m = mmg();
      expect(typeof m.factory()).toEqual('function');
    });

    it('the default factory creates a dom node', function() {
      var m = mmg();
      var foo = function() {};
      expect(jasmine.isDomNode(m.factory()()));
      expect(m.factory(foo)).toEqual(m);
      expect(m.factory()).toEqual(foo);
    });

    it('can be assigned a new factory function', function() {
      var m = mmg();
      var foo = function() {};
      expect(typeof m.factory()).toEqual('function');
      expect(m.factory(foo)).toEqual(m);
      expect(m.factory()).toEqual(foo);
    });
  });

  describe('geojson interface', function() {
    it('returns its empty features geojson', function() {
      var m = mmg();
      expect(m.features()).toEqual([]);
      expect(m.features().length).toEqual(0);
    });

    it('empties its parent and clears the internal feature collection on clear', function() {
      var m = mmg();
      expect(m.features(null)).toEqual(m);
    });
  });

  describe('marker addition', function() {
    it('adds an element to its parent when a single marker is there', function() {
      var mapdiv = document.createElement('div');
      var pt = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [-77, 37.8]
          },
          "properties": { }
        }]
      };
      var layer = mmg().features(pt.features);
      var m = new MM.Map(mapdiv, layer)
        .setCenterZoom(new MM.Location(37.8, -77), 7);
      expect(layer.parent.childNodes.length).toEqual(1);
    });

    it('removes that element when called with geojson null', function() {
      var mapdiv = document.createElement('div');
      var pt = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [-77, 37.8]
          },
          "properties": { }
        }]
      };
      var layer = mmg().features(pt.features);
      var m = new MM.Map(mapdiv, layer)
        .setCenterZoom(new MM.Location(37.8, -77), 7);
      expect(layer.parent.childNodes.length).toEqual(1);
      layer.features(null);
      expect(layer.parent.childNodes.length).toEqual(0);
    });
  });

  describe('sorting function', function() {
    it('sorts points by y-coordinate', function() {
      var ft = [
      {
          'geometry': { 'coordinates': [0, 0] },
          'properties': { 'order': 2 }
      },
      {
          'geometry': { 'coordinates': [0, -10] },
          'properties': { 'order': 1 }
      },
      {
          'geometry': { 'coordinates': [0, 10] },
          'properties': { 'order': 3 }
      }
      ];
      var layer = mmg().features(ft);
      expect(layer.features()[0].properties.order).toEqual(3);
      expect(layer.features()[1].properties.order).toEqual(2);
      expect(layer.features()[2].properties.order).toEqual(1);
    });
  });

  describe('marker loading from a url', function() {
    it('can load markers from a URL', function() {
      var layer;
      runs(function() {
        layer = mmg().url('mock/onepoint.geojson');
      });
      waits(100);
      runs(function() {
        expect(layer.features().length).toEqual(1);
      });
    });

    it('calls a callback when features are loaded', function() {
      var layer;
      var obj = new Klass();
      spyOn(obj, 'callback');
      runs(function() {
        layer = mmg().url('mock/onepoint.geojson', obj.callback);
      });
      waits(100);
      runs(function() {
        expect(layer.features().length).toEqual(1);
        expect(obj.callback).toHaveBeenCalled();
      });
    });
  });
});
