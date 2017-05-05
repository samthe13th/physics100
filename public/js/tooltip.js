var timeline = [];
var textdims, twidth, twidth2;
var paper, pointerlength;
var current = -1;
var _tip;
var Tip = {
    current: -1,
    new: function (r_stage) {
        paper = r_stage;
    }
}
function addTip(text, x, y, dir, background, fontcolor) {
    timeline.push({ text: text, x: x, y: y, dir: dir, background: background, fontcolor: fontcolor });
}
function nextTip() {
    if (Tip.current < (timeline.length - 1)) {
        if (Tip.current !== -1) {
            _tip.remove();
        }
        showTip(Tip.current + 1);
        Tip.current++;
    } else if (Tip.current === (timeline.length - 1)) {
        _tip.remove();
        Tip.current++;
    }
}
function showTip(i) {
    var text = timeline[i].text;
    var x = timeline[i].x;
    var y = timeline[i].y;
    var dir = timeline[i].dir;
    var background = timeline[i].background;
    var fontcolor = timeline[i].fontcolor;
    var tip, tipbubble, tiptext;
    var shadowoffset = 3;
    //   var anchor = w / 2;
    var textpadding = 50;
    pointerlength = 80;
    var tipPointer = function (dir) {
        var tippointer;
        if (dir === "up") {
            tippointer = paper.path(["M", tiptext.attr("x"), (tipbubble.attr("height") + (2 * pointerlength)), "l", -30, (-(pointerlength) - 5), "l", 60, 0, "Z"]).attr({ "stroke": "none", "fill": background });
        } else if (dir === "right") {
            tippointer = paper.path(["M", 0, ((tipbubble.attr("height") / 2) + pointerlength), "l", (5 + pointerlength), -30, "l", 0, 60, "Z"]).attr({ "stroke": "none", "fill": background });
        } else if (dir === "down") {
            tippointer = paper.path(["M", tiptext.attr("x"), 0, "l", -30, (pointerlength + 5), "l", 60, 0, "Z"]).attr({ "stroke": "none", "fill": background });
        } else if (dir === "left") {
            tippointer = paper.path(["M", (tipbubble.attr("width") + (2 * pointerlength)), ((tipbubble.attr("height") / 2) + pointerlength), "l", (-pointerlength - 5), -30, "l", 0, 60, "Z"]).attr({ "stroke": "none", "fill": background });
        }
        return tippointer;
    }
    $("body").append("<div id=tooltip></div>")
    //paper = Raphael("tooltip", 400, 400);
    tip = paper.set();
    tipbubble = paper.rect(pointerlength, pointerlength, 100, 100).attr({ "fill": background, "stroke": "none" });
    tiptext = paper.text(pointerlength, pointerlength, text)
        .attr({
            "font-size": "22px",
            "fill": fontcolor
        });
    tipbubble.attr({ "width": (tiptext.getBBox().width + pointerlength), "height": (tiptext.getBBox().height + pointerlength) });
    tiptext.attr({ "x": ((tipbubble.getBBox().width / 2) + pointerlength), "y": ((tipbubble.getBBox().height / 2) + pointerlength) });
    tp = tipPointer(dir);
    tip.push(tipbubble);
    tip.push(tiptext);
    tip.push(tp);
    tip.id = "test";
    var tipleft, tiptop;
    if (dir === "up") {
        tiptop = y - tipbubble.attr("height") - (2 * pointerlength);
        tipleft = x - (tipbubble.attr("width") / 2) - pointerlength;
    } else if (dir === "right") {
        tiptop = y - pointerlength - (tipbubble.attr("height") / 2);
        tipleft = x;
    } else if (dir === "down") {
        tiptop = y;
        tipleft = x - (tipbubble.attr("width") / 2) - pointerlength;
    } else if (dir === "left") {
        tiptop = y - pointerlength - (tipbubble.attr("height") / 2);
        tipleft = x - (2 * pointerlength) - tipbubble.attr("width");
    }
    tip.transform(["T", tipleft, tiptop]);
    _tip = tip;
}
function parseTextArray(text) {
    var textstr = ""
    for (var i = 0; i < text.length; i++) {
        textstr += "<tspan x='10' dy='30'>" + text[i] + "</tspan>"
    }
    return textstr;
}
function pointer(x, y, dir) {
    var path = "";
    path += "<path style='fill:rgba(0,0,0,0.5)' d='M" + x + " " + y + " L75 200 L225 200 Z' />"
    return path;
}