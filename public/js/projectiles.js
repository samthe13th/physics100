var sandbox = Raphael(0, 10, 600, 600);
var ground = 370;
var parameters = {
    "angle": 45,
    "height": 100,
    "speed": 20
}
var drag = function () {
    if (tooltip !== undefined) {
        tooltip.remove();
    }
    this.label.attr({ text: (slider.sliderPoint / 10) + " sec" });
    var currentSpeed
    var newpos;
    if (slider.sliderPoint === maxTime) {
        currentSpeed = endSpeed;
        newpos = calcPosition((pxltom * startx), (pxltom * starty), vx, vy, (slider.sliderPoint / 10), a);
        newpos.y = ground;
    } else {
        var cVy = Math.round(100 * (-1 * getVy(vy, 9.81, (slider.sliderPoint / 10)))) / 100;
        currentSpeed = Math.round(10 * Math.sqrt(Math.pow(cVy, 2) + Math.pow(vx, 2))) / 10;
        newpos = calcPosition((pxltom * startx), (pxltom * starty), vx, vy, (slider.sliderPoint / 10), a);
    }
    //var newdx = 1;
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
    });
    PE = (9.81 * current_height);
    KE = (0.5 * Math.pow(currentSpeed, 2));
    // PEtxt.attr({
    //     text: " PEtxt: " + (PE / totalEnergy)
    // });
    // KEtxt.attr({
    //     text: " KE: " + (KE / totalEnergy)
    // })
    PEbar.attr({
        width: barw * (PE / totalEnergy)
    })
    current_height -= (newdy * pxltom);
    current_dx += (newdx * pxltom);
    ball.x = newpos.x;
    ball.y = newpos.y;
    togglePoints();
};
var on = function () {
    dragging = { o: this };
}
var off = function () {
    dragging = { o: null };
}
var border, slider;
var border = sandbox.rect(10, 0, 580, 510).attr({ stroke: "#ffffff", fill: "#808cdc" });
var startx = 60;
var starty;
var height = parameters.height;
var current_height = height;
var current_dx = 0;
var v = 20.0;
setAngle(-Math.PI / 4);
var vx;
var vy;
var a = 9.81;
var mtopxl = 200 / 100;
var pxltom = 100 / 200;
starty = ground - (height * mtopxl);
var ball = sandbox.circle(startx, starty, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
var axis = sandbox.path(["M", startx, 100, "l", 0, 280, "l", 500, 0]).attr({ stroke: "#ffffff" });
var yline = sandbox.path(["M", startx, starty, "l", 0, 200]).attr({ stroke: "none" });
var coords = sandbox.text(startx + 40, starty - 20, "(0,100)").attr({ "fill": "white", "font-size": 18 });
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
var speedTxt = sandbox.text(320, 35, "Speed: " + parameters.speed + " m/s").attr({ "font-size": 25 }).attr({ fill: "#ffffff" });
var vxTxt = sandbox.text(500, 35, "Vx: " + vx + " m/s").attr({ "font-size": 16 }).attr({ fill: "#ffffff" });
var vyTxt = sandbox.text(500, 60, "Vy: " + (-1 * vy) + " m/s").attr({ "font-size": 16 }).attr({ fill: "#ffffff" });
var PE = (9.81 * current_height);
var KE = (0.5 * Math.pow(parameters.speed, 2));
var totalEnergy = KE + PE;
var PEtxt = sandbox.text(240, 75, "PE").attr({ fill: "#ffffff", "font-size": 24 });
var KEtxt = sandbox.text(400, 75, "KE").attr({ fill: "#ffffff", "font-size": 24 });
var barx = 270;
var bary = 65;
var barh = 20;
var barw = 100;
var barthickness = 5;
var energyBar = sandbox.rect(barx - barthickness, bary - barthickness, barw + 10, barh + 10).attr({
    fill: "white",
    stroke: "none"
})
var KEbar = sandbox.rect(barx, bary, barw, barh).attr({
    fill: "purple",
    stroke: "none"
})
var PEbar = sandbox.rect(barx, bary, (barw * (PE / totalEnergy)), barh).attr({
    fill: "orange",
    stroke: "none"
})
function setAngle(x) {
    angle = x;
    setVxVy();
}
function setVxVy() {
    vx = Math.round(100 * v * Math.cos(angle)) / 100;
    vy = Math.round(100 * v * Math.sin(angle)) / 100;
}
function drawRulers() {
    drawRuler("y", startx, ground + 10);
    drawRuler("x", startx, ground + 10);
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
var slider = Slider(sandbox, 100, 460, 430, maxTime, drag, on, off);
slider.label = sandbox.text(slider.sliderX, (slider.sliderY - 20), "0 sec").attr({ "font-size": 16, "fill": "white" });
var params_btn_base = sandbox.rect(60, 25, 120, 50, 12)
    .attr({ "font-size": 12, "stroke": "white", "fill": "#5ccb58", "stroke-width": 2 })
var params_btn_txt = sandbox.text(120, 50, "Change \n Parameters").attr({ fill: "white", "font-size": 18 })
var params_btn = sandbox.set()
    .push(params_btn_base)
    .push(params_btn_txt)
    .click(function () {
        makeScreen2();
    })
    .mouseover(function () {
        $("body").css({ cursor: "pointer" });
    })
    .mouseout(function () {
        $("body").css({ cursor: "default" });
    })
var path = sandbox.set();
drawPath();
function drawPath() {
    path.forEach(function (e) {
        e.remove();
    })
    path = sandbox.set();
    for (var i = 5; i < slider.snap; i += 5) {
        var p = calcPosition((pxltom * startx), (pxltom * starty), vx, vy, (i / 10), a);
        var point = makePoint(p);
        point.pos = i;
        path.push(point);
    }
    togglePoints();
}
function makePoint(p) {
    return sandbox.circle(p.x, p.y, 2).attr({ stroke: "white", opacity: 0.6 });
}
function togglePoints() {
    path.forEach(function (e) {
        if (e.pos > slider.sliderPoint) {
            e.attr({ opacity: 0 })
        } else {
            e.attr({ opacity: 0.6 })
        }
    });
}
var tooltip = sandbox.set()
    .push(sandbox.rect(200, 100, 300, 200, 15).attr({ fill: "white", stroke: "none" }))
    .push(sandbox.path(["M", 200, 260, "l", -90, 170, "l", 220, -200])).attr({ fill: "white", stroke: "none" })
    .push(sandbox.text(350, 200, "Drag the time \n slider to move \n the projectile")).attr({ "font-size": 30 })
makeScreen2();
function makeScreen2() {
    var param_offset_y = 140;
    var axis_label1 = sandbox.text(300, 410, "metres").attr({ "font-size": 18, "fill": "white", "stroke-width": 1 });
    var axis_label2 = sandbox.text(30, 240, "metres").attr({ "font-size": 18, "fill": "white" }).rotate(-90)
    var screen2 = Raphael(0, 10, 600, 600);
    var mask = screen2.rect(10, 0, 580, 510).attr({ "fill": "white", "stroke": "white", "opacity": 0.7 })
    var params = screen2.rect(50, 100, 490, 300, 15).attr({
        stroke: "none", fill: "#85d582"
    });
    var angletext = screen2.text(240, param_offset_y, "Angle").attr({ "font-size": 18 });
    var heighttext = screen2.text(240, (param_offset_y + 80), "Height").attr({ "font-size": 18 });
    var speedtext = screen2.text(240, (param_offset_y + 160), "Speed").attr({ "font-size": 18 });
    var ballAngle = 0;
    var aHead = 12;
    var cx = 80;
    var csize = 160;
    var arrow = screen2.path("M" + cx + " " + cx + " " + "L" + cx + " " + (aHead + 5) + " l" + (-aHead / 2) + " 0 l" + (aHead / 2) + " " + (-aHead) + "l" + (aHead / 2) + " " + aHead + "l" + (-aHead / 2) + " 0 Z")
        .attr({ "stroke": "white", "stroke-width": 4, "fill": "white" })
        .translate(350, 185);
    //arrow.angle = 0;
    var ball2 = screen2.circle(430, 265, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
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
        starty = ground - (height * mtopxl);
        parameters.height = height;
    };
    var angle_slider = Slider(screen2, 90, param_offset_y + 40, 300, 180, drag_angle, on, off);
    angle_slider.label = screen2.text(angle_slider.sliderX, (angle_slider.sliderY - 20), parameters.angle + ' degs').attr({ "font-size": 14 });
    angle_slider.setSlider(parameters.angle);
    arrow.rotate(parameters.angle, cx, (csize / 2));
    arrow.angle = parameters.angle;
    var height_slider = Slider(screen2, 90, (param_offset_y + 120), 300, 100, drag_height, on, off);
    height_slider.label = screen2.text(height_slider.sliderX, (height_slider.sliderY - 20), parameters.height + " m").attr({ "font-size": 14 });
    height_slider.setSlider(parameters.height);
    var speed_slider = Slider(screen2, 90, (param_offset_y + 200), 300, 40, drag_speed, on, off);
    speed_slider.label = screen2.text(speed_slider.sliderX, (speed_slider.sliderY - 20), parameters.speed + " m/s").attr({ "font-size": 14 });
    speed_slider.setSlider(parameters.speed);
    var close_circle = screen2.rect(470, 350, 60, 40, 10).attr({ fill: "white", stroke: "none" });
    var close_btn = screen2.text(498, 372, "OK")
        .attr({ "font-size": 24, "fill": "#5ccb58" })
    var close = screen2.set();
    close.push(close_btn)
        .push(close_circle)
        .click(function () {
            setAngle(arrow.angle * (Math.PI / 180) - (Math.PI / 2));
            current_dx = 0;
            setVxVy();
            setMaxTime();
            slider.setSnap(maxTime);
            setEndSpeed();
            var balldx = startx - ball.x;
            ball.translate(balldx, (starty - ball.y));
            ball.x = startx;
            current_height = height;
            coords.attr({ text: "(0," + current_height + ")" })
            coords.translate(balldx, (starty - ball.y));
            ball.y = starty;
            var sliderpos = ((slider.xabs - slider.sliderX) / ((slider.sliderLength - 10) / slider.snap));
            slider.setSlider(-sliderpos);
            slider.label.attr({
                text: "0 sec"
            })
            speedTxt.attr({
                text: " Speed: " + parameters.speed + " m/s"
            });
            vyTxt.attr({
                text: " Vy: " + Math.round(100 * (-1 * getVy(vy, 9.81, (slider.sliderPoint / 10)))) / 100 + " m/s"
            });
            vxTxt.attr({
                text: " Vx: " + vx + " m/s"
            });
            PE = (9.81 * current_height);
            KE = (0.5 * Math.pow(parameters.speed, 2));
            totalEnergy = KE + PE;
            PEbar.attr({
                width: barw * (PE / totalEnergy)
            })
            // PEtxt.attr({
            //     text: " PEtxt: " + (PE / totalEnergy)
            // });
            // KEtxt.attr({
            //     text: " KE: " + (KE / totalEnergy)
            // })
            slider.sliderPoint = 0;
            screen2.remove();
            drawPath();
            // vxTxt.set
        })
        .mouseover(function () {
            $("body").css({ cursor: "pointer" });
        })
        .mouseout(function () {
            $("body").css({ cursor: "default" });
        })
}