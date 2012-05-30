var wax = wax || {};
wax.movetip = {};

wax.movetip = function() {
    var popped = false,
        t = {},
        anchor,
        offset = { x: 0, y: 0 },
        parent;

    var tooltip = document.body.appendChild(document.createElement('div'));
    tooltip.className = 'wax-movetip';
    tooltip.style.display = 'none';

    var close_button = tooltip.appendChild(document.createElement('a'));
    close_button.href = '#close';
    close_button.className = 'close';
    close_button.innerHTML = 'Close';
    close_button.style.display = 'none';

    bean.add(close_button, 'click touchend', function closeClick(e) {
        e.stop();
        hide();
        popped = false;
    });

    // Hide a given tooltip.
    function hide() {
        tooltip.style.display = 'none';
    }

    function off() {
        parent.style.cursor = 'default';
        if (!popped) hide();
    }

    function on(o) {
        var content;
        if (popped) return;
        if ((o.e.type === 'mousemove' || !o.e.type)) {

            content = o.content || o.formatter({ format: 'teaser' }, o.data);
            if (!content) return;

            tooltip.style.display = 'block';
            console.log(tooltip);
            parent.style.cursor = 'pointer';
            tooltip.innerHTML = content;

        } else {

            content = o.content || o.formatter({ format: 'teaser' }, o.data);
            if (!content) return;

            if (o.anchor) {
              anchor = o.anchor;
            } else {
              anchor = wax.u.eventoffset(o.e);
            }

            tooltip.style.display = 'block';
            tooltip.innerHTML = content;
            tooltip.className += ' wax-movetip-popup';
            popped = true;

            t.move();
        }
    }

    t.parent = function(x) {
        if (!arguments.length) return parent;
        parent = x;
        return t;
    };

    t.anchor = function(x) {
        if (x) anchor = x;
    };

    t.offset = function(x) {
        if (x) offset = x;
    };

    t.move = function(x) {
        tooltip.style.left = anchor.x - (offset.x) + 'px';
        tooltip.style.top = anchor.y - (offset.y) + 'px';
    };

    t.element = function() {
        return tooltip;
    };

    t.events = function() {
        return {
            on: on,
            off: off
        };
    };

    return t;
};

