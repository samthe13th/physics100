var sliderWidth = 10
var sliderRoundness = 8;
var dragging = { o: null };

var sliderX, sliderY;

var Slider = function (stage, x, y, l, m, drag, on, off) {
    var bar, rtnSlider, label;
    var snap = m;
    var snapTo = [];
    bar = stage.rect(x, y, l, sliderWidth, sliderRoundness).attr({ fill: "white", opacity: 0.5, stroke: "none" });
    rtnSlider = stage.rect(x, y - (sliderWidth / 2), 10, 20).attr({ fill: "white", stroke: "none" })
        .drag(drag, on, off);
    rtnSlider.sliderX = x;
    rtnSlider.sliderY = y;
    rtnSlider.sliderLength = l;
    rtnSlider.xabs = rtnSlider.sliderX;
    rtnSlider.setColor = function (c) {
        bar.attr({ fill: c });
    }
    rtnSlider.setSnap = function (s) {
        rtnSlider.snap = s;
    }
    rtnSlider.label = function (l) {
        rtnSlider.label = stage.text(rtnSlider.sliderX, (rtnSlider.sliderY - 20), "0 " + l).attr({ "font-size": 20 });
    }
    rtnSlider.hideSlider = function () {
        bar.hide();
        this.hide();
    }
    rtnSlider.setSlider = function (p) {
        var div = (rtnSlider.sliderLength - 10) / rtnSlider.snap;
        rtnSlider.xabs += p * div;
        rtnSlider.translate((p * div), 0);
        rtnSlider.label.translate((p * div), 0);
    }
    rtnSlider.snapTo = snapTo;
    rtnSlider.snap = snap;
    return rtnSlider;
}
document.onmousemove = function (e) {
    $("#op").text(e.pageX);
    var xdiff, moveTo, endPoint;
    var o = dragging.o;
    var trans;
    if (dragging.o !== null) {
        xdiff = e.pageX - o.xabs;
        moveTo = o.xabs + xdiff;
        endPoint = o.sliderX + o.sliderLength - 10;
        if (e.pageX <= o.sliderX) {
            trans = o.sliderX - o.xabs;
            o.xabs = o.sliderX;
        } else if (moveTo >= endPoint) {
            trans = endPoint - o.xabs;
            o.xabs = endPoint;
        } else {
            trans = xdiff;
            o.xabs += xdiff;
        }
        o.translate(trans, 0);
        o.label.translate(trans, 0);
        o.sliderPoint = Math.round(((o.xabs - o.sliderX) / ((o.sliderLength - 10) / o.snap)));
    }
}