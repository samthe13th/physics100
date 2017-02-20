var sliderWidth = 10
var sliderRoundness = 8;
var dragging = { o: null };

var sliderX, sliderY, sliderLength;

var Slider = function (stage, x, y, l, m, drag, on, off) {
    var bar, rtnSlider, label;
    var snap = m;
    var snapTo = [];
    var makeSnapPoints = function () {
        for (var i = 0; i < snap; i++) {
            var point = sliderX + ((i + 1) * (sliderLength / snap));
            snapTo.push(Math.round(point));
        }
    }
    sliderX = x;
    sliderY = y;
    sliderLength = l;
    makeSnapPoints();
    bar = stage.rect(sliderX, sliderY, sliderLength, sliderWidth, sliderRoundness).attr({ fill: "white", opacity: 0.5, stroke: "none" });
    rtnSlider = stage.rect(sliderX, sliderY - (sliderWidth / 2), 10, 20).attr({ fill: "white", stroke: "none" })
        .drag(drag, on, off);
    rtnSlider.xabs = sliderX;
    rtnSlider.setColor = function (c) {
        bar.attr({ fill: c });
    }
    rtnSlider.setSnap = function (s) {
        rtnSlider.snap = s;
    }
    rtnSlider.label = function (l) {
        rtnSlider.label = stage.text(sliderX, (sliderY - 20), "0 " + l).attr({ "font-size": 20 });
    }
    rtnSlider.hideSlider = function () {
        bar.hide();
        this.hide();
    }
    rtnSlider.setSlider = function (p) {
        var div = (sliderLength - 10) / rtnSlider.snap;
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
        endPoint = sliderX + sliderLength - 10;
        if (e.pageX <= sliderX) {
            trans = sliderX - o.xabs;
            o.xabs = sliderX;
        } else if (moveTo >= endPoint) {
            trans = endPoint - o.xabs;
            o.xabs = endPoint;
        } else {
            trans = xdiff;
            o.xabs += xdiff;
        }
        o.translate(trans, 0);
        o.label.translate(trans, 0);
        o.sliderPoint = Math.round(((o.xabs - sliderX) / ((sliderLength - 10) / o.snap)));
    }
}