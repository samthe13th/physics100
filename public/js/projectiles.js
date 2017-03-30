
(function () {
    "use strict";
    var angle, ground, newdx, newdy, sandbox, positions, parameters, stage, slider;
    var startx, starty, height, current_height, current_dx, v, vx, vy, a;
    var mtopxl, pxltom, ball, axis, coords, endSpeed, maxTime;
    var speedTxt, vxTxt, vyTxt, PE, KE, totalEnergy, PEtxt, KEtxt;
    var ebar_params, energyBar, KEbar, PEbar;
    var slider, params_btn_base, params_btn_txt, params_btn, path, tooltip;
    sandbox = Raphael(0, 10, 600, 600);
    positions = {};
    parameters = {
        "angle": 45,
        "height": 100,
        "speed": 20,
        "coords": { offx: 40, offy: -20 }
    }
    stage = sandbox.rect(10, 0, 580, 510).attr({ stroke: "#ffffff", fill: "#5cadd6" });
    setParams();
    axis = sandbox.path(["M", startx, 100, "l", 0, 280, "l", 500, 0]).attr({ stroke: "#ffffff" });
    setEndSpeed();
    setMaxTime();
    makeBall();
    makeTxtDisplays();
    makeEnergyBar();
    makeRulers();
    slider = Slider(sandbox, 100, 460, 430, maxTime, drag, function () { });
    slider.setColor("rgba(255, 255, 255, 0.5)");
    slider.setLabel("secs");
    slider.setDiv(10);
    //slider.label = sandbox.text(slider.sliderX, (slider.sliderY - 20), "0 sec").attr({ "font-size": 16, "fill": "white" });
    makeParamsBtn();
    path = sandbox.set();
    drawPath();
    makeSetParamsScreen();
    tooltip = sandbox.set()
        .push(sandbox.rect(200, 100, 300, 200, 15).attr({ fill: "white", stroke: "none" }))
        .push(sandbox.path(["M", 200, 260, "l", -90, 170, "l", 220, -200])).attr({ fill: "white", stroke: "none" });

    setTimeout(function () {
        var tooltip_txt = sandbox.text(350, 190, "Drag the time \n slider to move \n the projectile");
        tooltip.push(tooltip_txt).attr({ "font-size": 30 });
    });

    //tooltip_txt.translate(350, 190);
    //350,200
    function getTransString(x, y) { return ("T" + x + "," + y) }
    function makeTxtDisplays() {
        setTimeout(function () {
            speedTxt = sandbox.text(320, 35, "Speed: " + parameters.speed + " m/s").attr({ "font-size": 25 }).attr({ fill: "#ffffff" });
            vxTxt = sandbox.text(500, 35, "Vx: " + vx + " m/s").attr({ "font-size": 16 }).attr({ fill: "#ffffff" });
            vyTxt = sandbox.text(500, 60, "Vy: " + (-1 * vy) + " m/s").attr({ "font-size": 16 }).attr({ fill: "#ffffff" });
        }, 10)
    }
    function makeEnergyBar() {
        PE = (9.81 * current_height);
        KE = (0.5 * Math.pow(parameters.speed, 2));
        totalEnergy = KE + PE;
        PEtxt = sandbox.text(0, 0, "PE").attr({ fill: "#ffffff", "font-size": 24 });
        PEtxt.translate(240, 85);
        KEtxt = sandbox.text(0, 0, "KE").attr({ fill: "#ffffff", "font-size": 24 });
        KEtxt.translate(400, 85);
        ebar_params = {
            x: 270,
            y: 65,
            h: 20,
            w: 100,
            thickness: 5
        }
        energyBar = sandbox.rect(ebar_params.x - ebar_params.thickness, ebar_params.y - ebar_params.thickness, ebar_params.w + 10, ebar_params.h + 10).attr({
            fill: "white",
            stroke: "none"
        })
        KEbar = sandbox.rect(ebar_params.x, ebar_params.y, ebar_params.w, ebar_params.h).attr({
            fill: "purple",
            stroke: "none"
        })
        PEbar = sandbox.rect(ebar_params.x, ebar_params.y, (ebar_params.w * (PE / totalEnergy)), ebar_params.h).attr({
            fill: "orange",
            stroke: "none"
        })
    }
    function makeParamsBtn() {
        params_btn_base = sandbox.rect(60, 25, 120, 50, 12)
            .attr({ "font-size": 12, "stroke": "white", "fill": "#5ccb58", "stroke-width": 2 });
        //x = 120, y = 50
        setTimeout(function () {
            params_btn_txt = sandbox.text(120, 50, "Change \n Parameters").attr({ fill: "white", "font-size": 18 });
            //   params_btn_txt.translate(120, 50);
            params_btn = sandbox.set()
                .push(params_btn_base)
                .push(params_btn_txt)
                .click(function () {
                    makeSetParamsScreen();
                })
                .mouseover(function () {
                    $("body").css({ cursor: "pointer" });
                })
                .mouseout(function () {
                    $("body").css({ cursor: "default" });
                })
        }, 100)
    }

    function eventTimer() {
        setInterval(function () {
            position = positions[slider.sliderPoint];
            ball.transform(getTransString(position.pos.x, positions[slider.sliderPoint].pos.y));
            coords.attr("text", "(" + position.dist + "," + position.height + ")");
            coords.transform(getTransString((position.pos.x + parameters.coords.offx), (positions[slider.sliderPoint].pos.y) + parameters.coords.offy));
            vyTxt.attr("text", "Vy: " + position.vy + " m/s");
            PE = (9.81 * position.height);
            KE = (0.5 * Math.pow(position.speed, 2));
            if (totalEnergy > 0) {
                PEbar.attr({
                    width: ebar_params.w * (PE / totalEnergy)
                })
            }
        }, 100)
    }

    eventTimer();

    function makeBall() {
        ball = sandbox.circle(0, 0, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
        ball.transform(getTransString(startx, starty));
        coords = sandbox.text(0, 0, "(0,100)").attr({ "fill": "white", "font-size": 18 });
        coords.transform(getTransString((startx + parameters.coords.offx), (starty + parameters.coords.offy)));
        coords.x = startx + 30;
        coords.y = starty - 20;
        ball.x = startx;
        ball.y = starty;
        ball.startx = ball.x;
        ball.starty = starty * mtopxl;
    }

    function setParams() {
        height = parameters.height;
        current_height = height;
        current_dx = 0;
        v = 20.0;
        setAngle(-Math.PI / 4);
        a = 9.81;
        mtopxl = 200 / 100;
        pxltom = 100 / 200;
        ground = 370;
        startx = 60;
        starty = ground - (height * mtopxl);
    }

    function setEndSpeed() {
        endSpeed = Math.round(10 * getSpeed(speed(vx, vy), a, height)) / 10;
    }

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
    function preload() {
        positions = {};
        var pl_vy, pl_speed, pl_time, pl_pos, pl_dy, pl_height;
        for (var i = 0; i <= maxTime; i++) {
            pl_pos = calcPosition((pxltom * startx), (pxltom * starty), vx, vy, (i / 10), a);
            if (i === maxTime) {
                pl_speed = endSpeed;
                pl_pos.y = ground;
            } else {
                pl_vy = Math.round(100 * (-1 * getVy(vy, 9.81, (i / 10)))) / 100;
                if (isNaN(pl_vy)) {
                    pl_vy = 0;
                };
                pl_speed = Math.round(10 * Math.sqrt(Math.pow(pl_vy, 2) + Math.pow(vx, 2))) / 10;
            }
            pl_time = i / 10;
            pl_dy = pl_pos.y - starty;
            pl_height = current_height - (pl_dy * pxltom);
            positions[i] = {};
            positions[i].speed = (Math.round(10 * pl_speed) / 10);
            console.log("speed: " + positions[i].speed);
            positions[i].vy = pl_vy;
            positions[i].dist = Math.round((pl_pos.x - startx) * pxltom);
            positions[i].pos = pl_pos;
            positions[i].height = Math.round(pl_height);
        }
    }
    function setAngle(x) {
        angle = x;
        setVxVy();
    }
    function setVxVy() {
        vx = Math.round(100 * v * Math.cos(angle)) / 100;
        vy = Math.round(100 * v * Math.sin(angle)) / 100;
    }
    function makeRulers() {
        drawRuler("y", startx, ground + 10);
        drawRuler("x", startx, ground + 10);
    }
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
    function drawPath() {
        path.forEach(function (e) {
            e.remove();
        })
        path = sandbox.set();
        for (var i = 2; i < slider.step; i += 2) {
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
                e.attr({ visibility: "hidden" })
            } else {
                e.attr({ visibility: "visible" })
            }
        });
    }
    var position;
    function drag() {
        // position = positions[slider.sliderPoint];
        if (tooltip !== undefined) {
            tooltip.remove();
        }
        // ball.transform(getTransString(position.pos.x, positions[slider.sliderPoint].pos.y));
        // coords.attr("text", "(" + position.dist + "," + position.height + ")");
        // coords.transform(getTransString((position.pos.x + parameters.coords.offx), (positions[slider.sliderPoint].pos.y) + parameters.coords.offy));
        // //speedTxt.attr("text", "Speed: " + position.speed + " m/s");
        // vyTxt.attr("text", "Vy: " + position.vy + " m/s");
        // PE = (9.81 * position.height);
        // KE = (0.5 * Math.pow(position.speed, 2));
        // if (totalEnergy > 0) {
        //     PEbar.attr({
        //         width: ebar_params.w * (PE / totalEnergy)
        //     })
        // }
    };
    function setMaxTime() {
        maxTime = Math.round(timeAtGround(getSpeed(vy, a, height), vy, a) * 10)
    }

    function makeSetParamsScreen() {
        var param_offset_y = 140;
        var axis_label1 = sandbox.text(300, 410, "metres").attr({ "font-size": 18, "fill": "white", "stroke-width": 1 });
        var axis_label2 = sandbox.text(30, 240, "metres").attr({ "font-size": 18, "fill": "white" }).rotate(-90)
        var paramsScreen = Raphael(0, 10, 600, 600);
        var mask = paramsScreen.rect(10, 0, 580, 510).attr({ "fill": "white", "stroke": "white", "opacity": 0.7 })
        setTimeout(function () {
            var params = paramsScreen.rect(50, 100, 490, 300, 15).attr({
                stroke: "none", fill: "#85d582"
            });
            // console.log("param_offset_y = " + param_offset_y);
            var angletext;
            var angletext = paramsScreen.text(240, param_offset_y, "Angle").attr({ "font-size": 18 })
            var heighttext = paramsScreen.text(240, (param_offset_y + 80), "Height").attr({ "font-size": 18 });
            var speedtext = paramsScreen.text(240, (param_offset_y + 160), "Speed").attr({ "font-size": 18 });
            var ballAngle = 0;
            var aHead = 12;
            var cx = 80;
            var csize = 160;
            var arrow = paramsScreen.path("M" + cx + " " + cx + " " + "L" + cx + " " + (aHead + 5) + " l" + (-aHead / 2) + " 0 l" + (aHead / 2) + " " + (-aHead) + "l" + (aHead / 2) + " " + aHead + "l" + (-aHead / 2) + " 0 Z")
                .attr({ "stroke": "white", "stroke-width": 4, "fill": "white" })
                .translate(350, 185);
            var ball2 = paramsScreen.circle(430, 265, 10).attr({ stroke: "#ffffff", "stroke-width": 2 });
            ball2.y;
            var drag_angle = function () {
                //this.label.attr({ text: angle_slider.sliderPoint + " degs" });
                var da = angle_slider.sliderPoint - arrow.angle;
                arrow.rotate(da, cx, (csize / 2));
                arrow.angle = angle_slider.sliderPoint;
                parameters.angle = arrow.angle;
            };
            var drag_speed = function () {
                //   this.label.attr({ text: (speed_slider.sliderPoint) + " m/s" });
                v = speed_slider.sliderPoint;
                parameters.speed = v;
            };
            var drag_height = function () {
                //  this.label.attr({ text: height_slider.sliderPoint + " m" });
                height = height_slider.sliderPoint;
                starty = ground - (height * mtopxl);
                parameters.height = height;
            };
            var angle_slider = Slider(paramsScreen, 90, param_offset_y + 40, 300, 180, drag_angle, function () { });
            // angle_slider.label = paramsScreen.text(angle_slider.sliderX, (angle_slider.sliderY - 20), parameters.angle + ' degs').attr({ "font-size": 14 });
            angle_slider.setLabel("degs");
            angle_slider.setSlider(parameters.angle);
            angle_slider.setColor("rgba(255, 255, 255, 0.5)");
            arrow.rotate(parameters.angle, cx, (csize / 2));
            arrow.angle = parameters.angle;
            var height_slider = Slider(paramsScreen, 90, (param_offset_y + 120), 300, 100, drag_height, function () { });
            height_slider.setLabel("m");
            // height_slider.label = paramsScreen.text(height_slider.sliderX, (height_slider.sliderY - 20), parameters.height + " m").attr({ "font-size": 14 });
            height_slider.setSlider(parameters.height);
            height_slider.setColor("rgba(255, 255, 255, 0.5)");
            var speed_slider = Slider(paramsScreen, 90, (param_offset_y + 200), 300, 40, drag_speed, function () { });
            // speed_slider.label = paramsScreen.text(speed_slider.sliderX, (speed_slider.sliderY - 20), parameters.speed + " m/s").attr({ "font-size": 14 });
            speed_slider.setLabel("m/s");
            speed_slider.setSlider(parameters.speed);
            speed_slider.setColor("rgba(255, 255, 255, 0.5)");
            var close_circle = paramsScreen.rect(470, 350, 60, 40, 10).attr({ fill: "white", stroke: "none" });
            var close_btn = paramsScreen.text(498, 372, "OK")
                .attr({ "font-size": 24, "fill": "#5ccb58" })
            var close = paramsScreen.set();
            close.push(close_btn)
                .push(close_circle)
                .click(function () {
                    slider.setSlider(0);
                    setAngle(arrow.angle * (Math.PI / 180) - (Math.PI / 2));
                    current_dx = 0;
                    setVxVy();
                    setMaxTime();
                    slider.setstep(maxTime);
                    setEndSpeed();
                    ball.transform(getTransString(startx, starty));
                    current_height = height;
                    coords.attr({ text: "(0," + current_height + ")" });
                    coords.transform(getTransString((startx + parameters.coords.offx), (starty + parameters.coords.offy)));
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
                    var PEbar_width;
                    if (totalEnergy > 0) {
                        PEbar_width = ebar_params.w * (PE / totalEnergy);
                    } else {
                        PEbar_width = 0;
                    }
                    PEbar.attr({
                        width: PEbar_width
                    })
                    slider.sliderPoint = 0;
                    paramsScreen.remove();
                    drawPath();
                    preload();
                    slider.setSlider(0);
                })
                .mouseover(function () {
                    $("body").css({ cursor: "pointer" });
                })
                .mouseout(function () {
                    $("body").css({ cursor: "default" });
                })
        }, 10);
    }
})()