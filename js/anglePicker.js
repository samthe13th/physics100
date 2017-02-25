var AP = {}
var APSet = {};
AP.create = function (id, size, color, r, fn) {
    console.log("Make ap");
    var arc = "default";
    var paper = Raphael(id, size, size);
    var offset = size / 10;
    var csize = size - (offset * 2);
    var cx = (csize / 2);
    var cy = cx;
    var radius = cx;
    var line;
    var line2;
    var APcolor = color;
    var rotation = Math.PI / 4;
    var angles = rotateAxis(r)
    var p1 = ((size / 2) + calcPos(r, (size / 2)).x);
    var oArrow = paper.circle((size / 2), (size / 2), size / 2).attr({ "stroke": APcolor, "opacity": 0.2, "stroke-width": 2 })
    var axis = paper.path("M" + (size / 2) + " " + 0 + "l0 " + size + " M0 " + (size / 2) + "l" + size + " 0")
        .rotate(r, size / 2, size / 2);
    var base;
    rotateAxis(45);
    base = paper.circle(cx, cx, radius)
        .attr({ "stroke": "none", "fill": APcolor, "opacity": 0.5, "angles": [1, 2, 3] })
        .translate(offset + " " + offset)
        .mousemove(function (evt) {
            var da, ma, la;
            var e = evt.target;
            var dim = e.getBoundingClientRect();
            var x = evt.clientX - dim.left;
            var y = evt.clientY - dim.top;
            var dx = x - radius;
            var dy = radius - y;
            line.attr({ "opacity": 1 })
            ma = calcAngle(dx, dy);
            la = calcAngle(cx, 5);
            snapa = snap(ma, angles);
            da = snapa - line.a;
            line.rotate(da, line.cx, (csize / 2));
            if (line.a === 360) {
                line.a = 1;
            } else {
                line.a += da;
            }
        })
        .click(function () {
            var da2 = line.a - line2.a;
            line2.rotate(da2, line.cx, (csize / 2));
            line2.a = line.a;
            drawArc((Math.PI * line2.a) / 180);
            APSet[base.id].angle = line2.a;
            fn();
        })
        .mouseout(function () {
            line.attr({ "opacity": 0 });
        })
    APSet[base.id] = { angle: 0 };
    var aHead = 10;
    // rotateAxis(45);
    line = paper.path("M" + cx + " " + cx + " " + "L" + cx + " " + (aHead + 5) + " l" + (-aHead / 2) + " 0 l" + (aHead / 2) + " " + (-aHead) + "l" + (aHead / 2) + " " + aHead + "l" + (-aHead / 2) + " 0 Z")
        .attr({ "stroke": "white", "stroke-width": 2, "opacity": 0.8, "fill": "white" })
        .translate(offset + " " + offset)
        .click(function () {
            var da2 = line.a - line2.a;
            line2.rotate(da2, line.cx, (csize / 2));
            line2.a = line.a;
            drawArc((Math.PI * line2.a) / 180);
            APSet[base.id].angle = line2.a;
            fn();
        })
        .mouseover(function () {
            this.attr({ "opacity": 1 })
        })
    line.a = 0;
    line.cx = cx;
    line.cy = cy;
    line2 = paper.path("M" + cx + " " + cx + " " + "L" + cx + " " + (aHead + 5) + " l" + (-aHead / 2) + " 0 l" + (aHead / 2) + " " + (-aHead) + "l" + (aHead / 2) + " " + aHead + "l" + (-aHead / 2) + " 0 Z")
        .attr({ "stroke": "black", "stroke-width": 2, "fill": "black" })
        .translate(offset + " " + offset)
    line2.a = 0;
    var updateAngle = function () {
        fn();
        var da2 = line.a - line2.a;
        line2.rotate(da2, line.cx, (csize / 2));
        line2.a = line.a;
        drawArc((Math.PI * line2.a) / 180);
        APSet[base.id].angle = line2.a;
    }
    var drawArc = function (a) {
        if (arc !== "default") {
            arc.remove()
        };
        var pos = calcPos(a, radius);
        var flag = 0
        if (a > Math.PI) {
            flag = 1;
        }
        var newArc = paper.path("M" + cx + " " + cx + " l0 " + (-csize / 2) + " A" + (csize / 2) + " " + (csize / 2) + " 0 " + flag + " 1 " + pos.x + " " + pos.y + " Z")
            .attr({ "fill": "black", "stroke": "none", "opacity": 0.5 })
            .toBack()
            .translate(offset + " " + offset)
        arc = newArc
    }
    return { id : base.id };
}
function rotateAxis(a) {
    var addAngle = a;
    var angles = [0, 90, 180, 270];
    for (var i = 0; i < 4; i++) {
        angles.push(addAngle);
        addAngle += 90;
    }
    return angles;
}
function calcAngle(x, y) {
    var angle;
    if (x >= 0) {
        if (y >= 0) { angle = Math.abs(Math.atan(x / y)) }
        else { angle = Math.PI / 2 + ((Math.PI / 2) - Math.abs(Math.atan(x / y))) }
    } else {
        if (y < 0) { angle = Math.abs(Math.atan(x / y)) + (Math.PI) }
        else { angle = (3 * Math.PI / 2) + ((Math.PI / 2) - Math.abs(Math.atan(x / y))) }
    }
    return Math.round(180 * angle / Math.PI);
}
function calcPos(a, r) {
    var o = {};
    o.y = r - (r * Math.cos(a));
    o.x = r + (r * Math.sin(a));
    return o;
}
function snap(e, list) {
    var n = 0;
    var diff = e - list[0];
    for (var i = 1; i < list.length; i++) {
        if (Math.abs(e - list[i]) < diff) {
            diff = Math.abs(e - list[i]);
            n = list[i];
        }
    }
    return n;
}