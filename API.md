# The Markers Layer

`mapbox.markers()` is a markers library that makes it easier to add HTML elements
on top of maps in geographical locations and interact with them. Internally,
markers are stored as [GeoJSON](http://www.geojson.org/) objects, though
interfaces through CSV and simple Javascript are provided.

## mapbox.markers()

`mapbox.markers()` is the singular entry point to this library - it creates a
new layer into which markers can be placed and which can be added to
a Modest Maps map with `.addLayer()`

### markers.named([value])

Set the name of this markers layer. The argument, if given, must be a string.
If no argument is given, returns the current name of the layer. Names are useful
for finding and interacting with layers in a map. The default name of a markers
layer is 'markers'.

### markers.renderer([value])

Defines a new renderer function, and if the layer already has points added to it,
re-renders them with the new renderer. Renderer functions are what turn GeoJSON feature
objects into HTML elements on the map.

The argument should be a function that takes a
[GeoJSON feature object](http://geojson.org/geojson-spec.html#feature-objects)
and returns an HTML element.

Due to the way that `markers.js` allows multiple layers of interactivity, factories
that want their elements to be interactive **must** either set `.style.pointerEvents = 'all'` on
them via Javascript, or have an equivalent CSS rule with `pointer-events: all` that affects
the elements.

If value is not specified, returns the current renderer function.

### markers.features([value])

This is the central function for setting the contents of a markers layer: it runs the provided
features through the filter function and then through the renderer function to create elements
for the map. If the layer already has features, they are replaced with the new features.

The argument should be
a array of [GeoJSON feature objects](http://geojson.org/geojson-spec.html#feature-objects).
An empty array will clear the layer of all features

If the value is not specified, returns the current array of features.

### markers.sort([value])

Markers are typically sorted in the DOM in order for them to correctly visually overlap. By default,
this is a function that sorts markers by latitude value - `geometry.coordinates[1]`.

The argument should be a function that takes two GeoJSON feature objects and returns a number indicating
sorting direction - fulfilling the [Array.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort)
interface.

If the value is not specified, returns the current function used to sort.

The default sorting function is:

    function(a, b) {
        return b.geometry.coordinates[1] -
          a.geometry.coordinates[1];
    }

### markers.filter([value])

Markers can also be filtered before appearing on the map. This is a purely presentational filter -
the underlying features, which are accessed by `.features()`, are unaffected. Setting a new
filter can therefore cause points to be displayed which were previously hidden.

The argument should be a functoin that takes a GeoJSON feature object and returns `true`
to allow it to be displayed or `false` to hide it.

If the value is not specified, returns the current function used to filter features.

The default filter function is:

    function() { return true; }

### markers.url(url [, callback])

This provides another way of adding features to a map - by loading them from a remote GeoJSON file.

The first argument should be a URL to a GeoJSON file on a server. If the server is remote, the
GeoJSON file must be served with a `.geojsonp` extension and respond to the JSONP callback `grid`.

The second argument is optional and should be a callback that is called after the request finishes,
with the features array (if any) and the layer instance as arguments.

### markers.csv(value)

[CSV](http://en.wikipedia.org/wiki/Comma-separated_values) can be an easier format to master than
GeoJSON. The argument to this method must be a string of CSV data. This method returns the markers
layer. The CSV file must include columns beginning with `lat` and `lon` in any casing (Latitude, latitude, lat are acceptable).
If it can find features in the CSV file, the `.features()` of the layer are set to them - otherwise
it will throw an error about not finding headers.

### markers.extent()

Return the extent of all of the features provided.
Returns an array of two `{ lat: 23, lon: 32 }` objects compatible with
Modest Maps's `extent()` call. If there are no features, the extent is set to
`Infinity` in all directions, and if there is one feature, the extent is set
to its point exactly.

### markers.addCallback(event, callback)

Adds a callback that is called on certain events by this layer. These are primarily used by `mmg_interaction`, but otherwise useful to support more advanced bindings on mmg layers that are bound at times when the mmg object may not be added to a map - like binding to the map's `panned` event to clear tooltips.

Event should be a String which is one of the following:

* `drawn`: whenever markers are drawn - which includes any map movement
* `markeradded`: when markers are added anew

Callback is a Function that is called with arguments depending on what `event` is bound:

* `drawn`: the layer object
* `markeradded`: the new marker

### markers.removeCallback(event, callback)

This removes a callback bound by `.addCallback(event, callback)`.

The `callback` argument must be the same Function as was given in `addCallback`. The `event` argument must be the same String that was given in `addCallback`

## mapbox.markers.interaction(value)

Classic interaction, hovering and/or clicking markers and seeing their details,
is supported by `marker_interaction` and customizable through its methods.
This supports both mouse & touch input.

Adds tooltips to your markers, for when a user hovers over or taps the features.

The single argument must be a markers layer. This returns an `interaction` instance which provides methods for customizing how the layer behaves.

### interaction.hideOnMove([value])

Determines whether tooltips are hidden when the map is moved. The single argument should be `true` or `false` or not given in order to retrieve the current value.

### interaction.exclusive([value])

Determines whether a single popup should be open at a time, or unlimited. The single argument should be `true` or `false` or not given in order to retrieve the current value.

### interaction.formatter([value])

Set or get the formatter function, that decides how data goes from being in a feature's `properties` to the HTML inside of a tooltip. This is a getter setter that takes a Function as its argument.

The default formatter is:

    function(feature) {
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
    }
