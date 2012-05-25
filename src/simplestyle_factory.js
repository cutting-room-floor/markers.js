function simplestyle_factory(feature) {

    var sizes = {
      small: [20, 50],
      medium: [30, 70],
      large: [35, 90]
    };

    var size = feature.properties['marker-size'] || 'medium';
    var symbol = (feature.properties['marker-symbol']) ? '-' + feature.properties['marker-symbol'] : '';
    var color = feature.properties['marker-color'] || '7e7e7e';
    color = color.replace('#', '');
    
    var d = document.createElement('div');
    d.style.width = sizes[size][0] + 'px';
    d.style.height = sizes[size][1] + 'px';
    d.style.marginTop = -(sizes[size][1] / 2) + 'px';
    d.style.marginLeft = -(sizes[size][0] / 2) + 'px';

    d.style.backgroundImage = 'url(http://a.tiles.mapbox.com/v3/marker/' +
      'pin-' + size[0] + symbol + '+' + color + '.png)';

    d.style.textIndent = -1e8;
    d.innerHTML = feature.properties.name || '';

    return d;
}
