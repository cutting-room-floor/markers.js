var wax = wax || {};
wax.movetip = {};

wax.movetip = function() {
    var popped = false,
        t = {},
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
        return t;
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

            tooltip.style.display = 'block';
            tooltip.innerHTML = content;
            tooltip.className += ' wax-movetip-popup';
            popped = true;

            t.move();
        }
        return t;
    }

    t.parent = function(x) {
        if (!arguments.length) return parent;
        parent = x;
        return t;
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

