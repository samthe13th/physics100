var drag = function () {
    this.label.attr({ text: (sliderPoint / 10) + " sec" });
    var currentSpeed, newpos;
    if (sliderPoint === maxTime) {
        currentSpeed = endSpeed;
        newpos = calcPosition(startx, starty, vx, vy, (sliderPoint / 10), a);
        newpos.y = 500;
    } else {
        currentSpeed = Math.round(10 * getSpeed(speed(vx, vy), 9.81, ball.dy)) / 10;
        newpos = calcPosition(startx, starty, vx, vy, (sliderPoint / 10), a);
    }
    ball.translate((newpos.x - ball.x), (newpos.y - ball.y));
    yline.translate((ball.x - yline.x),0);
    yline.x = ball.x
    ball.h = Math.round(100 * (height + pxltom * (ball.starty - ball.y))) / 100;
    ball.dy = Math.abs(ball.h - height);
    speedTxt.attr({
        text: " Speed: " + currentSpeed + " m/s"
    });
    vyTxt.attr({
        text: " Vy: " + Math.round(100 * (-1 * getVy(vy, 9.81, (sliderPoint / 10)))) / 100 + " m/s"
    })
    ball.x = newpos.x;
    ball.y = newpos.y;
};
var on = function () {
    dragging = { o: this };
}
var off = function () {
    dragging = { o: null };
}
var sandbox = Raphael(0, 10, 600, 500);
var border,slider;
var border = sandbox.rect(10, 0, 580, 410, 15).attr({ stroke: "#ffffff", fill: "#7c83cd" });;
var startx = 50;
var starty = 150;
var height = 100;
var v = 20;
setAngle(-Math.PI / 6);
var vx;
var vy;
var a = 9.81;
var ball = sandbox.circle(startx, starty, 10).attr({ stroke: "#ffffff" });
var axis = sandbox.path(["M", 50, 80, "l", 0, 280, "l", 500, 0]).attr({ stroke: "#ffffff" });
var yline = sandbox.path(["M", startx, starty, "l", 0, 200]).attr({ stroke: "none" })
yline.y = starty; 
yline.x = startx * mtopxl;
var mtopxl = 200 / height;
var pxltom = height / 200;
var endSpeed = Math.round(10 * getSpeed(speed(vx, vy), a, height)) / 10;
var endy = calcPosition(startx, starty, vx, vy, timeAtGround(endSpeed, v, a), a);
ball.x = startx * mtopxl;
ball.y = starty * mtopxl;
ball.startx = ball.x;
ball.starty = starty * mtopxl;
ball.endy = ball.y + (100 * mtopxl);
function calcPosition(x0, y0, vx, vy, t, a) {
    var pos = {};
    pos.x = (x0 + (vx * t)) * mtopxl;
    pos.y = (y0 + (vy * t) + (0.5 * a * Math.pow(t, 2))) * mtopxl;
    return pos;
}
function getSpeed(vy, a, d) {
    var v = Math.sqrt(Math.pow(vy, 2) + (2 * a * d));
    return v;
}
function timeAtGround(vf, v0, a) {
    var t = (vf - v0) / a;
    return t;
}
function speed(x, y) {
    return (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
}
function getVy(v0, a, t) {
    return (v0 + a * t);
}
var maxTime = Math.round(timeAtGround(getSpeed(vy, a, height), vy, a) * 10);
var speedTxt = sandbox.text(500, 80, "Speed: 0 m/s").attr({ "font-size": 20 }).attr({ fill: "#ffffff" });
var vxTxt = sandbox.text(500, 110, "Vx: " + vx + " m/s").attr({ "font-size": 14 }).attr({ fill: "#ffffff" });
var vyTxt = sandbox.text(500, 130, "Vy: " + (-1 * vy) + " m/s").attr({ "font-size": 14 }).attr({ fill: "#ffffff" });
// AP.create("svgstage", 200, "red", 75, function () {
//     console.log("do something");
// })
function setAngle(x) {
    angle = x;
    setVxVy();
}
function setVxVy() {
    vx = Math.round(100 * v * Math.cos(angle)) / 100;
    vy = Math.round(100 * v * Math.sin(angle)) / 100;
}
function drawRulers() {
    drawRuler("y", 50, 360);
    drawRuler("x", 50, 360);
}
drawRulers();
function drawRuler(id, x, y) {
    var ypos, xpos;
    var tickSize = 10;
    if (id === "y") {
        ypos = y;
        xpos = x;
        for (var i = 0; i < 15; i++) {
            sandbox.path(["M", xpos, ypos, "l", - tickSize, 0]).attr({ stroke: "#ffffff" });
            ypos -= (10 * mtopxl);
            if (tickSize === 10) {
                tickSize = 5;
            } else {
                tickSize = 10;
            }
        }
    } else {
        ypos = y;
        xpos = x;
        for (var i = 0; i < 26; i++) {
            sandbox.path(["M", xpos, ypos, "l", 0, tickSize]).attr({ stroke: "#ffffff" });
            xpos += (10 * mtopxl);
            if (tickSize === 10) {
                tickSize = 5;
            } else {
                tickSize = 10;
            }
        }
    }
}
var slider = Slider(sandbox,50, 40, 500, drag, on, off);
slider.label = sandbox.text(sliderX, (sliderY - 20), "0 sec").attr({ "font-size": 20 });
slider.setSnap(maxTime);
//sandbox.rect(0,0,600,500).attr({fill: "red"});
