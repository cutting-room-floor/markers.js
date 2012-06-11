function mmg_cluster(features, size) {
    if (!size) size = 200;
    var cluster = kmeans()
          .iterations(16)
          .size(size);

    for (var i = 0; i < features.length; i++) {
        cluster.add(features[i]);
    }

    var means = cluster.means();

    return means;
}
