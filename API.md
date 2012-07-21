# The Markers Layer

`mapbox.markers()` is a markers library that makes it easier to add HTML elements
on top of maps in geographical locations and interact with them. Internally,
markers are stored as [GeoJSON](http://www.geojson.org/) objects, though
interfaces through CSV and simple Javascript are provided.

## mapbox.markers()

`mapbox.markers()` is the singular entry point to this library - it creates a
new layer into which markers can be placed and which can be added to
a Modest Maps map with `.addLayer()`

### markers.named([name])

Set the name of this markers layer. The default name for a `markers` layer
is `'markers'`

**Arguments:**

* `name` if given, must be a string.

**Returns** the layer object if a new name is provided, otherwise the layer's existing name
if it is omitted.

### markers.factory([factoryfunction])

Define a new factory function, and if the layer already has points added to it,
re-render them with the new factory. Factory functions are what turn GeoJSON feature
objects into HTML elements on the map. Due to the way that `markers.js` allows multiple layers of interactivity, factories
that want their elements to be interactive **must** either set `.style.pointerEvents = 'all'` on
them via Javascript, or have an equivalent CSS rule with `pointer-events: all` that affects
the elements.

**Arguments:**

* `factoryfunction` should be a function that takes a
  [GeoJSON feature object](http://geojson.org/geojson-spec.html#feature-objects)
  and returns an HTML element,
  or omitted to get the current value.

**Returns** the layer object if a new factory function is provided, otherwise the layer's existing factory function

### markers.features([features])

This is the central function for setting the contents of a markers layer: it runs the provided
features through the filter function and then through the factory function to create elements
for the map. If the layer already has features, they are replaced with the new features.
An empty array will clear the layer of all features.

**Arguments:**

* `features` can be a array of [GeoJSON feature objects](http://geojson.org/geojson-spec.html#feature-objects),
  or omitted to get the current value.

**Returns** the layer object if a new array of features is provided, otherwise the layer's features

### markers.sort([sortfunction])

Markers are typically sorted in the DOM in order for them to correctly visually overlap. By default,
this is a function that sorts markers by latitude value - `geometry.coordinates[1]`.

**Arguments:**

* `sortfunction` can be a function that takes two GeoJSON feature objects and returns a number indicating
sorting direction - fulfilling the [Array.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort)
interface, or omitted to get the current value.

**Returns the layer object if a new function is specified, otherwise the current function used to sort.

**Example:**
    // The default sorting function is:
    layer.sort(function(a, b) {
        return b.geometry.coordinates[1] -
          a.geometry.coordinates[1];
    });

### markers.filter([filterfunction])

Set the layer's filter function and refilter features. Markers can also be filtered before appearing on
the map. This is a purely presentational filter -
the underlying features, which are accessed by `.features()`, are unaffected. Setting a new
filter can therefore cause points to be displayed which were previously hidden.

**Arguments:**

* `filterfunction` can be a function that takes a GeoJSON feature object and returns `true`
  to allow it to be displayed or `false` to hide it, or omitted to get the current value

**Returns the layer object if a new function is specified, otherwise the current function used to filter.

**Example:**

    // The default filter function is:
    layer.filter(function() { return true; });

### markers.id([idfunction])

Set the id getter for this layer. The id getter is a funcion that takes a GeoJSON feature
and returns a _unique id_ for that feature. If this is provided, the layer can optimize repeated
calls to `.features()` for animation purposes, since updated markers will not be recreated,
only modified.

**Arguments:**

* `idfunction` must be a function that takes a GeoJSON object and returns a unique ID for it
  that does not change for the same features on repeated calls

**Returns the layer object if a new function is specified, otherwise the current function used to get ids.

**Example:**

    // The default filter function is:
    var _seq = 0;
    layer.id(function() { return ++_seq; });

### markers.url(url [, callback])

Loading features from a remote GeoJSON file into the layer.

**Arguments:**

* `url` should be a URL to a GeoJSON file on a server. If the server is remote, the
  GeoJSON file must be served with a `.geojsonp` extension and respond to the JSONP callback `grid`.
* `callback`, if provided, is a function that is called after the request finishes
  with the features array and the layer instance as arguments.

### markers.csv(csvstring)

Convert a string of [CSV](http://en.wikipedia.org/wiki/Comma-separated_values) data into GeoJSON
and set layer to show it as features.
If it can find features in the CSV file, the `.features()` of the layer are set to them - otherwise
it will throw an error about not finding headers.

**Arguments:**

* `csvstring` must be a string of CSV data. This method returns the markers
  layer. The CSV file must include columns beginning with `lat` and `lon` in any
  case (Latitude, latitude, lat are acceptable).

**Returns** the markers layer

### markers.extent()

Get the extent of all of the features provided.

**Returns** an array of two `{ lat: 23, lon: 32 }` objects compatible with
Modest Maps's `extent()` call. If there are no features, the extent is set to
`Infinity` in all directions, and if there is one feature, the extent is set
to its point exactly.

### markers.addCallback(event, callback)

Adds a callback that is called on certain events by this layer. These are primarily used by `mmg_interaction`, but otherwise useful to support more advanced bindings on mmg layers that are bound at times when the mmg object may not be added to a map - like binding to the map's `panned` event to clear tooltips.

**Arguments:**

* `event` is a string of the event you want to bind the callback to
* `callback` is a funcion that is called on the event specified by `event`

Event should be a String which is one of the following:

* `drawn`: whenever markers are drawn - which includes any map movement
* `markeradded`: when markers are added anew

Callback is a Function that is called with arguments depending on what `event` is bound:

* `drawn`: the layer object
* `markeradded`: the new marker

**Returns** the markers layer

### markers.removeCallback(event, callback)

Remove a callback bound by `.addCallback(event, callback)`.

**Arguments:**

* `event` is a string of the event you want to bind the callback to
  This must be the same string that was given in `addCallback`

* `callback` is a funcion that is called on the event specified by `event`.
  This must be the same function as was given in `addCallback`. 

**Returns** the markers layer

## mapbox.markers.interaction(markerslayer)

Classic interaction, hovering and/or clicking markers and seeing their details,
is supported by `marker_interaction` and customizable through its methods.
This supports both mouse & touch input.

Adds tooltips to your markers, for when a user hovers over or taps the features.

**Arguments:**

* `markerslayer` must be a markers layer. 

**Returns** an `interaction` instance which provides methods for customizing how the layer behaves.

### interaction.hide_on_move([value])

Determines whether tooltips are hidden when the map is moved. The single argument should be `true` or `false` or not given in order to retrieve the current value.

**Arguments:**

* `value` must be true or false to activate or deactivate the mode

**Returns** the interaction instance.

### interaction.exclusive([value])

Determines whether a single popup should be open at a time, or unlimited. The single argument should be `true` or `false` or not given in order to retrieve the current value.

**Arguments:**

* `value` must be true or false to activate or deactivate the mode

**Returns** the interaction instance.

### interaction.formatter([formatterfunction])

Set or get the formatter function, that decides how data goes from being in a feature's `properties` to the HTML inside of a tooltip. This is a getter setter that takes a Function as its argument.

**Arguments:**

* `formatterfunction`: a new function that takes GeoJSON features as input and returns
  HTML suitable for tooltips, or omitted to get the current value.

**Returns** the interaction instance if a new formatter function is provided, otherwise the current formatter
function

**Example:**

    // The default formatter function
    interaction.formatter(function(feature) {
        var o = '', props = feature.properties;
        if (props.title) {
            o += '<h1 class="mmg-title">' + props.title + '</h1>';
        }
        if (props.description) {
            o += '<div class="mmg-description">' + props.description + '</div>';
        }
        if (typeof html_sanitize !== undefined) {
            o = html_sanitize(o,
                function(url) {
                    if (/^(https?:\/\/|data:image)/.test(url)) return url;
                },
                function(x) { return x; });
        }
        return o;
    });
