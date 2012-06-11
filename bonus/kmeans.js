// Extracted from polymaps; BSD licensed.
// k-means clustering
function kmeans() {
    var kmeans = {},
    points = [],
    iterations = 1,
    size = 1;

    kmeans.size = function(x) {
        if (!arguments.length) return size;
        size = x;
        return kmeans;
    };

    kmeans.iterations = function(x) {
        if (!arguments.length) return iterations;
        iterations = x;
        return kmeans;
    };

    kmeans.add = function(x) {
        points.push(x);
        return kmeans;
    };

    kmeans.means = function() {
        var means = [],
        seen = {},
        n = Math.min(size, points.length);

        // Initialize k random (unique!) means.
        for (var i = 0, m = 2 * n; i < m; i++) {
            var p = points[~~(Math.random() * points.length)],
                id = p.geometry.coordinates[0] + "/" + p.geometry.coordinates[1];
            if (!(id in seen)) {
                seen[id] = 1;
                if (means.push({
                    geometry: {
                        coordinates: [p.geometry.coordinates[0],
                            p.geometry.coordinates[1]]
                    }
                }) >= n) break;
            }
        }
        n = means.length;

        // For each iteration, create a kd-tree of the current means.
        for (var j = 0; j < iterations; j++) {
            var kd = kdtree().points(means);

            // Clear the state.
            for (var i = 0; i < n; i++) {
                var mean = means[i];
                mean.sumX = 0;
                mean.sumY = 0;
                mean.size = 0;
                mean.points = [];
            }

            // Find the mean closest to each point.
            for (var i = 0; i < points.length; i++) {
                var point = points[i], mean = kd.find(point);
                mean.sumX += point.geometry.coordinates[0];
                mean.sumY += point.geometry.coordinates[1];
                mean.size++;
                mean.points.push(point);
            }

            // Compute the new means.
            for (var i = 0; i < n; i++) {
                var mean = means[i];
                if (!mean.size) continue; // overlapping mean
                mean.geometry = {
                    type: 'Point',
                    coordinates: [
                        mean.sumX / mean.size,
                        mean.sumY / mean.size]
                };
            }
        }

        for (var k = means.length - 1; k > -1; k--) {
            if (!means[k].size) {
                means.splice(k, 1);
            }
        }

        return means;
    };

    return kmeans;
}

// kd-tree
function kdtree() {
    var kdtree = {},
    axes = [
        function(d) { return d.geometry.coordinates[0]; },
        function(d) { return d.geometry.coordinates[1]; }],
    root,
    points = [];

    kdtree.axes = function(x) {
        if (!arguments.length) return axes;
        axes = x;
        return kdtree;
    };

    kdtree.points = function(x) {
        if (!arguments.length) return points;
        points = x;
        root = null;
        return kdtree;
    };

    kdtree.find = function(x) {
        return find(kdtree.root(), x, root).point;
    };

    kdtree.root = function(x) {
        return root || (root = node(points, 0));
    };

    function node(points, depth) {
        if (!points.length) return;
        var axis = axes[depth % axes.length], median = points.length >> 1;
        points.sort(order(axis)); // could use random sample to speed up here
        return {
            axis: axis,
            point: points[median],
            left: node(points.slice(0, median), depth + 1),
            right: node(points.slice(median + 1), depth + 1)
        };
    }

    function distance(a, b) {
        var sum = 0;
        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i], d = axis(a) - axis(b);
            sum += d * d;
        }
        return sum;
    }

    function order(axis) {
        return function(a, b) {
            a = axis(a);
            b = axis(b);
            return a < b ? -1 : a > b ? 1 : 0;
        };
    }

    function find(node, point, best) {
        if (distance(node.point, point) < distance(best.point, point)) best = node;
        if (node.left) best = find(node.left, point, best);
        if (node.right) {
            var d = node.point[node.axis] - point[node.axis];
            if (d * d < distance(best.point, point)) best = find(node.right, point, best);
        }
        return best;
    }

    return kdtree;
}
