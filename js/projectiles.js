var sandbox = Raphael(0, 10, 600, 600);
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
    yline.translate((ball.x - yline.x), 0);
    yline.x = ball.x
    ball.h = Math.round(100 * (height + pxltom * (ball.starty - ball.y))) / 100;
    ball.dy = Math.abs(ball.h - height);
    speedTxt.attr({
        text: " Speed: " + currentSpeed + " m/s"
    });
    vyTxt.attr({
        text: " Vy: " + Math.round(100 * (-1 * getVy(vy, 9.81, (sliderPoint / 10)))) / 100 + " m/s"
    });
    vxTxt.attr({
        text: " Vx: " + vx
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
var border, slider;
var border = sandbox.rect(10, 0, 580, 510, 15).attr({ stroke: "#ffffff", fill: "#7c83cd" });
var startx = 50;
var starty; 
var height = 100;
var v = 0;
setAngle(-Math.PI / 6);
var vx;
var vy;
var a = 9.81;
starty = 250 - height;
var ball = sandbox.circle(startx, starty, 10).attr({ stroke: "#ffffff" });
var axis = sandbox.path(["M", 50, 80, "l", 0, 280, "l", 500, 0]).attr({ stroke: "#ffffff" });
var yline = sandbox.path(["M", startx, starty, "l", 0, 200]).attr({ stroke: "none" })
yline.y = starty;
yline.x = startx * mtopxl;
var mtopxl = 200 / height;
var pxltom = height / 200;
var endSpeed;
function setEndSpeed() {
    endSpeed = Math.round(10 * getSpeed(speed(vx, vy), a, height)) / 10;
}
setEndSpeed();
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
var maxTime;
var setMaxTime = function () {
    maxTime = Math.round(timeAtGround(getSpeed(vy, a, height), vy, a) * 10)
    console.log("max time: " + maxTime)
}
setMaxTime();
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
var slider = Slider(sandbox, 180, 450, 300, maxTime, drag, on, off);
slider.label = sandbox.text(sliderX, (sliderY - 20), "0 sec").attr({ "font-size": 18 });
var timetext = sandbox.text(130, 455, "Time:").attr({ "font-size": 18 });

var screen2 = Raphael(0, 10, 600, 500);
var params = screen2.rect(10, 0, 580, 410, 15).attr({ stroke: "#ffffff", fill: "#7c83cd" });
var angletext = screen2.text(120, 200, "Angle:").attr({ "font-size": 18 });
var heighttext = screen2.text(120, 260, "Height:").attr({ "font-size": 18 });
var speedtext = screen2.text(120, 320, "Speed:").attr({ "font-size": 18 });
var ballAngle = 0;
var aHead = 12;
var cx = 80;
// rotateAxis(45);
var csize = 160;
var arrow = screen2.path("M" + cx + " " + cx + " " + "L" + cx + " " + (aHead + 5) + " l" + (-aHead / 2) + " 0 l" + (aHead / 2) + " " + (-aHead) + "l" + (aHead / 2) + " " + aHead + "l" + (-aHead / 2) + " 0 Z")
    .attr({ "stroke": "white", "stroke-width": 4, "fill": "white" })
    .translate(100, 20);
arrow.angle = 0;
var ball2 = screen2.circle(180, 100, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
ball2.y;
var drag_angle = function () {
    this.label.attr({ text: sliderPoint + " degs" });
    var da = sliderPoint - arrow.angle;
    arrow.rotate(da, cx, (csize / 2));
    arrow.angle = sliderPoint;
};
var drag_speed = function () {
    this.label.attr({ text: (1 + sliderPoint) + " m/s" });
    v = sliderPoint + 1;
    console.log("v: " + v);
};
var drag_height = function () {
    this.label.attr({ text: sliderPoint + " m" });
};

var angle_slider = Slider(screen2, 180, 200, 300, 180, drag_angle, on, off);
angle_slider.label = screen2.text(sliderX, (sliderY - 20), "0" + ' degs').attr({ "font-size": 14 });
var height_slider = Slider(screen2, 180, 260, 300, 100, drag_height, on, off);
height_slider.label = screen2.text(sliderX, (sliderY - 20), "0 m").attr({ "font-size": 14 });
var speed_slider = Slider(screen2, 180, 320, 300, 39, drag_speed, on, off);
speed_slider.label = screen2.text(sliderX, (sliderY - 20), "1 m/s").attr({ "font-size": 14 });
var go_btn = screen2.rect(320, 50, 120, 50, 12)
    .attr({ "font-size": 12, "stroke": "white", "fill": "white", "opacity": 0.5 })
    .click(function () {
        console.log("clicked go");
        setAngle(arrow.angle * (Math.PI / 180) - (Math.PI / 2));
        setVxVy();
        setMaxTime();
        slider.setSnap(maxTime);
        setEndSpeed();
        // speedTxt.attr({
        //     text: " Speed: " + v + " m/s"
        // });
        // vyTxt.attr({
        //     text: " Vy: " + Math.round(100 * (-1 * getVy(vy, 9.81, (sliderPoint / 10)))) / 100 + " m/s"
        // });
        // vxTxt.attr({
        //     text: " Vx: " + vx
        // })
        screen2.remove();
    })
    .mouseover(function () {
        console.log("over go");
        $("body").css({ cursor: "pointer" });
    })
    .mouseout(function () {
        console.log("out go");
        $("body").css({ cursor: "default" });
    })
//sandbox.rect(0,0,600,500).attr({fill: "red"});