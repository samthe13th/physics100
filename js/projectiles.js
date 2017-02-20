var sandbox = Raphael(0, 10, 600, 600);
var parameters = {
    "angle": 5,
    "height": 10,
    "speed": 25
}
var drag = function () {
    this.label.attr({ text: (slider.sliderPoint / 10) + " sec" });
    var currentSpeed, newpos;
    if (slider.sliderPoint === maxTime) {
        currentSpeed = endSpeed;
        newpos = calcPosition((pxltom * startx), (pxltom * starty), vx, vy, (slider.sliderPoint / 10), a);
        newpos.y = 350;
    } else {
        var cVy = Math.round(100 * (-1 * getVy(vy, 9.81, (slider.sliderPoint / 10)))) / 100;
        currentSpeed = Math.round(10 * Math.sqrt(Math.pow(cVy, 2) + Math.pow(vx, 2))) / 10;
        newpos = calcPosition((pxltom * startx), (pxltom * starty), vx, vy, (slider.sliderPoint / 10), a);
    }
    var newdx = newpos.x - ball.x;
    var newdy = newpos.y - ball.y;
    ball.translate(newdx, newdy);
    coords.translate(newdx, newdy);
    coords.x += newdx;
    coords.y += newdy;
    yline.translate((ball.x - yline.x), 0);
    yline.x = ball.x
    ball.h = Math.round(100 * (height + pxltom * (ball.starty - ball.y))) / 100;
    ball.dy = Math.abs(ball.h - height);
    speedTxt.attr({
        text: " Speed: " + currentSpeed + " m/s"
    });
    vyTxt.attr({
        text: " Vy: " + Math.round(100 * (-1 * getVy(vy, 9.81, (slider.sliderPoint / 10)))) / 100 + " m/s"
    });
    vxTxt.attr({
        text: " Vx: " + vx + " m/s"
    })
    coords.attr({
        text: "(" + Math.round(current_dx + (newdx * pxltom)) + "," + Math.round(current_height - (newdy * pxltom)) + ")"
    })
    current_height -= (newdy * pxltom);
    current_dx += (newdx * pxltom);
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
var height = parameters.height;
var current_height = height;
var current_dx = 0;
var v = 20;
setAngle(-Math.PI / 4);
var vx;
var vy;
var a = 9.81;
var mtopxl = 200 / 100;
var pxltom = 100 / 200;
starty = 350 - (height * mtopxl);
var ball = sandbox.circle(startx, starty, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
var axis = sandbox.path(["M", 50, 80, "l", 0, 280, "l", 500, 0]).attr({ stroke: "#ffffff" });
var yline = sandbox.path(["M", startx, starty, "l", 0, 200]).attr({ stroke: "none" });
var coords = sandbox.text(startx + 40, starty - 20, "(0,100)").attr({ "fill": "white", "font-size": 16 });
coords.x = startx + 30;
coords.y = starty - 20;
yline.y = starty;
yline.x = startx * mtopxl;
var endSpeed;
function setEndSpeed() {
    endSpeed = Math.round(10 * getSpeed(speed(vx, vy), a, height)) / 10;
}
setEndSpeed();
ball.x = startx;
ball.y = starty;
ball.startx = ball.x;
ball.starty = starty * mtopxl;
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
}
setMaxTime();
var speedTxt = sandbox.text(500, 40, "Speed:" + parameters.speed + " m/s").attr({ "font-size": 20 }).attr({ fill: "#ffffff" });
var vxTxt = sandbox.text(500, 60, "Vx: " + vx + " m/s").attr({ "font-size": 14 }).attr({ fill: "#ffffff" });
var vyTxt = sandbox.text(500, 80, "Vy: " + (-1 * vy) + " m/s").attr({ "font-size": 14 }).attr({ fill: "#ffffff" });
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
            ypos -= 20;
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
var slider = Slider(sandbox, 90, 450, 300, maxTime, drag, on, off);
slider.label = sandbox.text(sliderX, (sliderY - 20), "0 sec").attr({ "font-size": 18 });
var params_btn = sandbox.rect(280, 35, 120, 50, 12)
    .attr({ "font-size": 12, "stroke": "white", "fill": "white", "opacity": 0.5 })
    .click(function () {
        makeScreen2();
    })
    .mouseover(function () {
        $("body").css({ cursor: "pointer" });
    })
    .mouseout(function () {
        $("body").css({ cursor: "default" });
    })


makeScreen2();
function makeScreen2() {
    var param_offset_y = 160;
    var timetext = sandbox.text(130, 455, "Time:").attr({ "font-size": 18 });
    var screen2 = Raphael(0, 10, 600, 600);
    var mask = screen2.rect(10, 0, 580, 510, 15).attr({ "fill": "white", "stroke": "white", "opacity": 0.7 })
    var params = screen2.rect(50, 100, 490, 340, 15).attr({ stroke: "none", fill: "#ff4f71" });
    var angletext = screen2.text(240, param_offset_y, "Angle").attr({ "font-size": 18 });
    var heighttext = screen2.text(240, (param_offset_y + 80), "Height").attr({ "font-size": 18 });
    var speedtext = screen2.text(240, (param_offset_y + 160), "Speed").attr({ "font-size": 18 });
    var ballAngle = 0;
    var aHead = 12;
    var cx = 80;
    var csize = 160;
    var arrow = screen2.path("M" + cx + " " + cx + " " + "L" + cx + " " + (aHead + 5) + " l" + (-aHead / 2) + " 0 l" + (aHead / 2) + " " + (-aHead) + "l" + (aHead / 2) + " " + aHead + "l" + (-aHead / 2) + " 0 Z")
        .attr({ "stroke": "white", "stroke-width": 4, "fill": "white" })
        .translate(350, 200);
    //arrow.angle = 0;
    var ball2 = screen2.circle(430, 280, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
    ball2.y;
    var drag_angle = function () {
        this.label.attr({ text: angle_slider.sliderPoint + " degs" });
        var da = angle_slider.sliderPoint - arrow.angle;
        arrow.rotate(da, cx, (csize / 2));
        arrow.angle = angle_slider.sliderPoint;
        parameters.angle = arrow.angle;
    };
    var drag_speed = function () {
        this.label.attr({ text: (speed_slider.sliderPoint) + " m/s" });
        v = speed_slider.sliderPoint;
        parameters.speed = v;
    };
    var drag_height = function () {
        this.label.attr({ text: height_slider.sliderPoint + " m" });
        height = height_slider.sliderPoint;
        starty = 350 - (height * mtopxl);
    };
    var angle_slider = Slider(screen2, 90, param_offset_y + 40, 300, 180, drag_angle, on, off);
    angle_slider.label = screen2.text(sliderX, (sliderY - 20), parameters.angle + ' degs').attr({ "font-size": 14 });
    angle_slider.setSlider(parameters.angle);
    arrow.rotate(parameters.angle, cx, (csize / 2));
    arrow.angle = parameters.angle;
    var height_slider = Slider(screen2, 90, (param_offset_y + 120), 300, 100, drag_height, on, off);
    height_slider.label = screen2.text(sliderX, (sliderY - 20), parameters.height + " m").attr({ "font-size": 14 });
    height_slider.setSlider(parameters.height);
    var speed_slider = Slider(screen2, 90, (param_offset_y + 200), 300, 40, drag_speed, on, off);
    speed_slider.label = screen2.text(sliderX, (sliderY - 20), parameters.speed + " m/s").attr({ "font-size": 14 });
    speed_slider.setSlider(parameters.speed);
    var close_circle = screen2.circle(515, 125, 15).attr({ fill: "white", opacity: 0.5, stroke: "none" });
    var close_btn = screen2.path(["M", 505, 115, "l", 20, 20, "M", 525, 115, "l", -20, 20])
        .attr({ "font-size": 12, "stroke": "#ff4f71", "stroke-width": 4 })
    var close = screen2.set();
    close.push(close_btn)
        .push(close_circle)
        .click(function () {
            setAngle(arrow.angle * (Math.PI / 180) - (Math.PI / 2));
            setVxVy();
            setMaxTime();
            slider.setSnap(maxTime);
            setEndSpeed();
            ball.translate(0, (starty - ball.y));
            current_height = height;
            coords.attr({ text: "(0," + current_height + ")" })
            coords.translate(0, (starty - ball.y));
            ball.y = starty;
            screen2.remove();
        })
        .mouseover(function () {
            $("body").css({ cursor: "pointer" });
        })
        .mouseout(function () {
            $("body").css({ cursor: "default" });
        })
}