// (function () {
    "use strict";
    window.$_dragging = { o: null, id: null };
    window.Slider = function (stage, x, y, l, m, drag, up) {
        var bar, rtnSlider, label
        var sliderWidth = 10
        var sliderRoundness = 8;
        var step = m;
        bar = stage.rect(x, y, l, sliderWidth, sliderRoundness).attr({ fill: "#7fa0d2", stroke: "none" });
        rtnSlider = stage.rect(x, y - (sliderWidth / 2), 10, 20).attr({ opacity: 0.7, fill: "white", stroke: "grey" })
            .drag(
            drag,
            function () {
                $_dragging = { o: this };
                $("body").css("cursor", "pointer");
                rtnSlider.calcSliderX();
            }, function () {
                $_dragging = { o: null, id: null };
                $("body").css("cursor", "default");
                up();
            });
        rtnSlider.width = sliderWidth;
        rtnSlider.x = x;
        rtnSlider.stage = stage;
        rtnSlider.bar = bar;
        rtnSlider.xoffset = stage.canvas.parentNode.offsetLeft;
        rtnSlider.sliderX = x + rtnSlider.xoffset;
        rtnSlider.sliderY = y;
        rtnSlider.sliderLength = l;
        rtnSlider.sliderPoint = 0;
        rtnSlider.units = "";
        rtnSlider.div = 1;
        rtnSlider.labelGroup = stage.set();
        rtnSlider.labelBack = stage.path(["M", (rtnSlider.sliderX - 24), (rtnSlider.sliderY - 36), "l", 60, 0, "l", 0, 20, "l", -20, 0, "l", -10, 10, "l", -10, -10, "l", -20, 0, "Z"]).attr({ "stroke": "none", "fill": "white", "opacity": "0.8" });
        rtnSlider.label = stage.text(rtnSlider.sliderX + 4, (rtnSlider.sliderY - 26), "").attr({ "font-size": 16, "fill": "black" });
        rtnSlider.labelGroup
            .push(rtnSlider.label)
            .push(rtnSlider.labelBack)
            .hide()
        rtnSlider.mouseover(function () {
            console.log("move slider");
            // rtnSlider.labelGroup.show();
            rtnSlider.labelGroup.show().animate({ opacity: 1 }, 300);
            $("body").css({ "cursor": "pointer" });
        });
        rtnSlider.mousedown(function () {
            console.log("click")
            rtnSlider.select = true;
        })
        rtnSlider.mouseout(function () {
            console.log("mouse out. Selected = " + rtnSlider.select);
            if (!rtnSlider.select) {
                console.log("fade")
                // $(rtnSlider.labelGroup.node).fadeOut(2000);
                rtnSlider.labelGroup.animate({ opacity: 0 }, 300, function () { this.hide() });
                //rtnSlider.labelGroup.hide();
                $("body").css({ "cursor": "default" });
            }
        })
        rtnSlider.setColor = function (c) {
            bar.attr({ fill: c });
        }
        rtnSlider.setStep = function (s) {
            rtnSlider.step = s;
        }
        rtnSlider.setLabel = function (l) {
            console.log("slider point: " + rtnSlider.sliderPoint)
            rtnSlider.units = l;
            rtnSlider.label.attr({ "text": (rtnSlider.sliderPoint / rtnSlider.div) + l, "font-size": 12 });
            // rtnSlider.label.hide();
        }
        rtnSlider.hideSlider = function () {
            bar.hide();
            this.hide();
        }
        rtnSlider.setColor = function (c) {
            if (Array.isArray(c)) {
                var grad = "180"
                for (var color in c) {
                    grad += "-" + c[color]
                }
                rtnSlider.bar.attr({ fill: grad });
            } else {
                rtnSlider.bar.attr({ fill: c });
            }
        }
        rtnSlider.setSlider = function (p) {
            console.log("set slider. label = " + rtnSlider.label)
            var toPoint = p;
            if (p < 0) {
                toPoint = 0;
            } else if (p > rtnSlider.step) {
                toPoint = rtnSlider.step;
            }
            var SP = rtnSlider.sliderPoint;
            var dSP = toPoint - SP;
            var div = (rtnSlider.sliderLength - 10) / rtnSlider.step;
            rtnSlider.translate((dSP * div), 0);
            rtnSlider.sliderPoint = toPoint;
            if (rtnSlider.label) {
                console.log("translate label " + rtnSlider.label.x);
                //     rtnSlider.label.translate((toPoint * div), 0);
                rtnSlider.label.translate((dSP * div), 0);
                rtnSlider.label.attr({ "text": (rtnSlider.sliderPoint / rtnSlider.div) + " " + rtnSlider.units });
                rtnSlider.labelBack.translate((dSP * div), 0);
            }
        }
        rtnSlider.setAbsX = function (x) {
            var newx = x - rtnSlider._.dx - rtnSlider.xoffset;
            rtnSlider.translate(newx, 0);
            rtnSlider.label.translate(newx, 0);
            rtnSlider.labelBack.translate(newx, 0);
        }
        rtnSlider.calcSliderX = function () {
            rtnSlider.xoffset = rtnSlider.stage.canvas.parentNode.offsetLeft;
            rtnSlider.sliderX = rtnSlider.xoffset;
        }
        rtnSlider.step = step;
        $(stage.canvas).mousemove(function (e) {
            var xdiff, moveTo, endPoint;
            var o = $_dragging.o;
            if ($_dragging.o !== null) {
                if (e.pageX <= o.sliderX + o.x) {
                    o.setAbsX(o.sliderX);
                } else if (e.pageX >= (o.x + o.sliderX + o.sliderLength - o.width)) {
                    o.setAbsX(o.sliderX + o.sliderLength - o.width)
                } else {
                    o.setAbsX(e.pageX - o.x);
                }
                o.sliderPoint = Math.round((o.step * (o.xoffset + o._.dx - o.sliderX)) / (o.sliderLength - o.width));
                o.label.attr({ "text": (o.sliderPoint / o.div) + " " + o.units });
            }
        })
        $(stage.canvas).mouseup(function (e) {
            if ($_dragging.o) {
                rtnSlider.labelGroup.animate({ opacity: 0 }, 600, function () { this.hide() });
                $_dragging.o.select = false;
            }
        })
        return rtnSlider;
    }
// })();