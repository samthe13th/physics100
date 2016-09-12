'use strict'
var game = new Phaser.Game(350, 350, Phaser.CANVAS, 'container', { preload: preload, create: create, update: update, render: render }, true);
var page = 1;
var tutorial = true;
var menuMode = false;
var progress = [];
var graphicsGroup;
var arrowGroup;
var rotHandlesGroup;
var arcGraphics;
var forceBtns;
var json;
var cAngle;
var currentArrow;
var aId;
var fDiff = 38;
var snap = 4;
var state = null;
var netForce = { "h": 0, "v": 0, "a": 0, "mag": 0 };
var gp = { fDist: 100, boxWidth: 0, arrowLength: 50, magLength: 50, arrowHead: 18, rotHandleOffset: 20 }
var fixedAngleArray = [0, (Math.PI / 2), Math.PI, (3 * Math.PI / 2), 2 * Math.PI];
var rotAngleArray = [0];
var dirArray = ["N", "E", "S", "W"];
var percents = [];
var helper;
var helpTracker = "t_addArrow";
var helpLevels = ["t_addArrow", "t_rotate", "t_addArrow2", "t_netForce", "t_removeArrow"];
var completedHelpLevels = [];
var helpTxt;
var helpGroup;
var fb = (function () {
    var ghostArrowDisplay, rArrow, hoverArrowDisplay;
    var arrowArray = [];
    var rotHandle, rotHandle2, rotHandle3, rotHandle4, currentRotHandle;
    var angleText, deg, rAxis, forceCenter, handle, centerHandle, hyp, rotHyp;
    var rFb = {};
    rFb.moveArrow = { "fType": "" };
    rFb.currentRotHandle = "";
    return rFb;
} ());
function preload() {
    game.load.spritesheet('arrowBtns', '../assets/freebody/btnSheet.png', 20, 20);
    game.load.spritesheet('forceBtns', '../assets/freebody/btnsBlank.png', 100, 30, 3);
    game.load.spritesheet('forces', '../assets/freebody/forceSheet2.png', 40, 40, 10);
    game.load.image('handle', '../assets/freebody/blank.png', 30, 30);
    game.load.image('centerHandle', '../assets/freebody/handle.png', 30, 30);
    game.load.image('forceCenter', '../assets/freebody/anchor.png', 15, 15);
    game.load.image('deg', '../assets/freebody/deg.png', 10, 10);
    game.load.image('rotHandle', '../assets/freebody/rotHandleRight.png');
    game.load.spritesheet('checkbox', '../assets/freebody/checkbox.png', 50, 50, 2);
}
function create() {
    Modal.init();
    aId = 1;
    fb.moveArrow.forces = game.add.sprite(0, 0, 'forces', 0);
    fb.moveArrow.dir = "";
    fb.arrowArray = [];
    fb.rotHyp = game.world.height / 2 - gp.rotHandleOffset;
    arcGraphics = game.add.graphics(0, 0);
    createForceCenter();
    createHandle();
    createRotHandles();
    createAxis();
    setUpGraphics();
    $.getJSON("../json/freebody.json", function (data) {
        json = data;
        setUpExercise();
        setUpMenus();
        setPercents();
    });
    setProgress();
    setDegs();
    fb.rArrow = game.add.graphics(0, 0);
    fb.hoverArrowDisplay = game.add.graphics(0, 0);
    drawArrow(fb.hoverArrowDisplay, findAngle(), 2, 0xCCCCCC);
    fb.hoverArrowDisplay.visible = false;
    fb.rArrow.visible = true;
    helpTracker = helpLevels[0];
    helper = game.add.graphics(0.0);
    createHelp();
    updateHelp();
}
function setProgress() {
    for (var i = 0; i < exercises.length; i++) {
        progress.push([
            { a: 0, m: 0, f: "" },
            { a: Math.PI / 2, m: 0, f: "" },
            { a: 3 * Math.PI / 2, m: 0, f: "" },
            { a: 2 * Math.PI, m: 0, f: "" },
            { a: 0, m: 0, f: "" },
            { a: Math.PI / 2, m: 0, f: "" },
            { a: 3 * Math.PI / 2, m: 0, f: "" },
            { a: 2 * Math.PI, m: 0, f: "" }
        ]);
    }
}
function setPercents() {
    for (var i = 0; i < exercises.length; i++) {
        percents.push("");
    }
}
function createForceCenter() {
    fb.forceCenter = game.add.button(0, 0, 'forceCenter', createArrow, this, 0, 0, 0);
    fb.forceCenter.anchor.set(0.5);
    fb.forceCenter.x = game.world.centerX;
    fb.forceCenter.y = game.world.centerY;
}
function createHandle() {
    fb.handle = game.add.sprite(0, 0, 'handle', 0);
    fb.handle.anchor.set(0.5);
    fb.handle.inputEnabled = true;
    fb.handle.events.onInputDown.add(handleDown, this);
    fb.handle.events.onInputUp.add(handleUp, this);
    fb.centerHandle = game.add.sprite(game.world.centerX, game.world.centerY, 'centerHandle', 0)
    fb.centerHandle.anchor.set(0.5);
    fb.centerHandle.visible = true;
}
function createArrow() {
    fb.ghostArrowDisplay = game.add.graphics(0, 0);
    fb.ghostArrowDisplay.visible = true;
    drawArrow(fb.ghostArrowDisplay, findAngle(), 0, 0xFFFFFF);
    fb.ghostArrowDisplay.mag = 0;
    fb.ghostArrowDisplay.radAngle = 0;
}
function createAxis(axis) {
    var axis = game.add.graphics(0, 0);
    fb.deg = game.add.sprite(100, 100, 'deg', 0);
    fb.deg.visible = false;
    axis.lineStyle(1, 0xffffff, 0.2);
    axis.moveTo(game.world.centerX, 0);
    axis.lineTo(game.world.centerX, game.world.height);
    axis.moveTo(0, game.world.centerY);
    axis.lineTo(game.world.width, game.world.centerY);
    axis.visible = true;
    fb.rAxis = game.add.graphics(0, 0);
    fb.rAxis.lineStyle(1, 0xffffff, 0.60)
    fb.rAxis.moveTo(game.world.centerX, -100);
    fb.rAxis.lineTo(game.world.centerX, game.world.width + 100);
    fb.rAxis.moveTo(-100, game.world.centerY);
    fb.rAxis.lineTo(game.world.width + 100, game.world.centerY);
    fb.rAxis.visible = true;
    fb.rAxis.pivot.x = game.world.centerX;
    fb.rAxis.pivot.y = game.world.centerY;
    fb.rAxis.x = game.world.centerX;
    fb.rAxis.y = game.world.centerY;
    fb.rAxis.inputEnabled = true;
    fb.rAxis.rotation = 0;
}
function createHelp() {
    var text = "test";
    var style = { font: "17px Helvetica", fill: "#000000", align: "center" };
    if (tutorial) { drawHelp() };
    helper.pivot.x = 80;
    helper.pivot.y = -25;
    helper.x = game.world.centerX;
    helper.y = game.world.centerY;
    helpTxt = game.add.text(game.world.centerX, game.world.centerY, "Helpful text \n goes here!", {
        font: "17px Helvetica",
        fill: "#000000",
        align: "center"
    });
    helpTxt.anchor.setTo(0.5, 0.5);
    if (helpTracker === null) {
        helper.visible = false;
    }
    helpTxt.y = game.world.centerY + helpTxt.height * 1.5;
    helpGroup = game.add.group();
    helpGroup.add(helper);
    helpGroup.add(helpTxt);
    helpGroup.y = -150;
}
function drawHelp() {
    helper.clear();
    helper.beginFill(0xffffff, 0.7);
    helper.drawRoundedRect(0, 0, 160, 100, 10);
    if (helpTracker === "t_addArrow") {
        helper.moveTo(60, 100);
        helper.lineTo(80, 120);
        helper.lineTo(100, 100);
    } else if (helpTracker === "t_rotate") {
        helper.moveTo(60, 0);
        helper.lineTo(165, -40);
        helper.lineTo(120, 0);
    } else if (helpTracker === "t_netForce") {
        helper.moveTo(60, 100);
        helper.lineTo(165, 140);
        helper.lineTo(110, 100);
    } else if (helpTracker === "t_removeArrow") {
        helper.moveTo(100, 0);
        helper.lineTo(160, -40);
        helper.lineTo(140, 0);
    } else {
        helpTxt.setText("");
    }
    helper.endFill();
}
//GRAPHICS
function updateHelp() {
    drawHelp();
    helper.visible = true;
    helpGroup.visible = true;
    if (helpTracker === "t_addArrow") {
        helpTxt.setText("To add arrows: \ndrag from \ncenter");
    } else if (helpTracker === "t_rotate") {
        helpGroup.y = - 140;
        helpGroup.x = - 90;
        helpTxt.setText("To rotate axis: \n drag axis \nclockwise");
    } else if (helpTracker === "t_netForce") {
        helpGroup.y = - 140;
        helpGroup.x = - 90;
        helpTxt.setText("Drag arrows \n to change \n magnitude");
    } else if (helpTracker === "t_removeArrow") {
        helpGroup.y = 40;
        helpGroup.x = - 90;
        helpTxt.setText("To remove arrows: \n click and drag \n arrow to center");
    } else {
        helper.visible = false;
        helpTxt.setText("");
    }
}
function setUpGraphics() {
    var graphics = game.add.graphics(game.world.centerX, game.world.centerY);
    for (var i = 0; i < dirArray.length; i++) {
        setUpArrow(dirArray[i], "rel", fixedAngleArray[i]);
    }
    for (var i = 0; i < dirArray.length; i++) {
        setUpArrow(dirArray[i], "abs", fixedAngleArray[i]);
    }
    groupRelAxisGraphics(graphics);
    window.graphics = graphics;
};
function groupRelAxisGraphics(graphics) {
    graphicsGroup = game.add.group();
    graphicsGroup.add(graphics);
    graphicsGroup.add(fb.N_rel_arrow.forces);
    graphicsGroup.add(fb.S_rel_arrow.forces);
    graphicsGroup.add(fb.W_rel_arrow.forces);
    graphicsGroup.add(fb.E_rel_arrow.forces);
    graphicsGroup.pivot.x = game.world.centerX;
    graphicsGroup.pivot.y = game.world.centerY;
    graphicsGroup.x = game.world.centerX;
    graphicsGroup.y = game.world.centerY;
    fb.angleText = game.add.text(0, 0, "", { font: "16px Arial", weight: "bold", fill: "white", align: "center" });
    fb.angleText.pivot.set(fb.angleText.width / 2, fb.angleText.height / 2);
}
function rotate(rads) {
    var degs = Math.round(rads * 180 / Math.PI);
    if (fb.rAxis.rotation === 0) {
        fb.angleText.visible = false;
        for (var i = 0; i < 4; i++) {
            if (fb.arrowArray[i].mag > 0) {
                fb.arrowArray[i + 4].hide(true)
            }
        }
        fb.deg.visible = false;
    } else {
        fb.angleText.visible = true;
        fb.deg.visible = true;
    }
    fb.rAxis.rotation = rads;
    graphicsGroup.rotation = rads;
    rotHandlesGroup.rotation = rads;
    drawArc(rads);
    fb.N_rel_arrow.degAngle = (Math.round(fb.N_rel_arrow.radAngle * 180 / Math.PI));
    fb.N_rel_arrow.drawForce(rads, 0);
    fb.E_rel_arrow.degAngle = (Math.round(fb.E_rel_arrow.radAngle * 180 / Math.PI));
    fb.E_rel_arrow.drawForce(rads, Math.PI / 2);
    fb.S_rel_arrow.degAngle = (Math.round(fb.S_rel_arrow.radAngle * 180 / Math.PI));
    fb.S_rel_arrow.drawForce(rads, Math.PI);
    fb.W_rel_arrow.degAngle = (Math.round(fb.W_rel_arrow.radAngle * 180 / Math.PI));
    fb.W_rel_arrow.drawForce(rads, 3 * Math.PI / 2);
    updateRotAngleArray(rads);
}

function updateRotAngleArray(rads) {
    rotAngleArray = [rads, rads + Math.PI / 2, rads + Math.PI, rads + 3 * Math.PI / 2];
}

function drawArc(rads) {
    arcGraphics.clear();
    arcGraphics.lineStyle(70, 0xFFFFFF, 0.70);
    arcGraphics.arc(game.world.centerX, game.world.centerY, 30, game.math.degToRad(-90) + fb.currentRotHandle.pos, rads - Math.PI / 2 + fb.currentRotHandle.pos, false);
    fb.angleText.text = Math.round(Math.round(rads * 180 / Math.PI));
    fb.angleText.x = 1.6 * gp.magLength * Math.sin((rads / 2) + fb.currentRotHandle.pos) + game.world.centerX - 10;
    fb.angleText.y = game.world.centerY - 1.6 * gp.magLength * Math.cos((rads / 2) + fb.currentRotHandle.pos);
    fb.deg.x = fb.angleText.x + 20;
    fb.deg.y = fb.angleText.y - 10;
    if (Math.round(Math.round(rads * 180 / Math.PI)) > 99) {
        fb.deg.x += 10;
    }
    if (Math.round(Math.round(rads * 180 / Math.PI)) < 10) {
        fb.deg.x -= 10;
    }
}
function addBtnText(btn, txt) {
    btn.text = game.add.text(btn.x - btn.width / 2, btn.y - btn.height / 2, txt, { font: "18px Arial", weight: "bold", fill: "0x000000", align: "center" });
    btn.text.x += (btn.width - btn.text.width) / 2;
    btn.text.y += btn.height - btn.text.height;
    btn.text.visible = false;
}
function setUpArrow(comp, axis, radAngle) {
    var dir = comp + "_" + axis;
    var arrowId = dir + "_arrow";
    var arrow;
    fb[arrowId] = game.add.graphics(0, 0);
    arrow = fb[arrowId];
    arrow.compass = comp;
    arrow.axis = axis;
    arrow.dir = dir;
    arrow.radAngle = radAngle;
    arrow.aId = aId;
    aId++;
    arrow.degAngle = Math.round(radAngle * 180 / Math.PI);
    arrow.fType = "";
    arrow.mag = 0;
    arrow.setForce = function () {
        arrow.fType = currentArrow.fType;
        arrow.mag = gp.arrowLength / gp.magLength;
    }
    arrow.setFrames = function () {
        if (arrow.fType == "Weight") {
            arrow.forces.frame = 1;
        } else if (arrow.fType == "Normal") {
            arrow.forces.frame = 2;
        } else if (arrow.fType == "Push") {
            arrow.forces.frame = 3;
        } else if (arrow.fType == "A on B") {
            arrow.forces.frame = 4;
        } else if (arrow.fType == "B on A") {
            arrow.forces.frame = 5;
        } else if (arrow.fType == "Tension") {
            arrow.forces.frame = 6;
        } else if (arrow.fType == "Air") {
            arrow.forces.frame = 7;
        } else if (arrow.fType == "Friction") {
            arrow.forces.frame = 8;
        } else if (arrow.fType == "C on B") {
            arrow.forces.frame = 9;
        }
    }
    arrow.setForces = function () {
        if (arrow == fb.N_rel_arrow || arrow == fb.N_abs_arrow) {
            arrow.forces = game.add.sprite(fb.forceCenter.x, fb.forceCenter.y - gp.fDist, 'forces', 0);
        } else if (arrow == fb.S_rel_arrow || arrow == fb.S_abs_arrow) {
            arrow.forces = game.add.sprite(fb.forceCenter.x, fb.forceCenter.y + gp.fDist, 'forces', 0);
        } else if (arrow == fb.W_rel_arrow || arrow == fb.W_abs_arrow) {
            arrow.forces = game.add.sprite(fb.forceCenter.x - gp.fDist, fb.forceCenter.y, 'forces', 0);
        } else if (arrow == fb.E_rel_arrow || arrow == fb.E_abs_arrow) {
            arrow.forces = game.add.sprite(fb.forceCenter.x + gp.fDist, fb.forceCenter.y, 'forces', 0);
        }
        arrow.forces.pivot.set(arrow.forces.width / 2, arrow.forces.height / 2);
    }
    arrow.setForces();
    arrow.hide = function (zero) {
        arrow.visible = false;
        arrow.mag = 0;
        arrow.forces.frame = 0;
        if (zero) {
            arrow.fType = "";
        }
    }
    arrow.drawForce = function (r, a) {
        arrow.forces.rotation = -r;
        arrow.radAngle = r + a;
        if (arrow.mag > 0) {
            gp.arrowLength = gp.magLength * arrow.mag;
            drawArrow(arrow, arrow.radAngle, gp.magLength * arrow.mag, 0x000000);
        }
    }
    fb.arrowArray.push(arrow);
}
function setUpExercise() {
    var exercise = json.exercises[exercises[page - 1] - 1];
    var pGif = exercise.gif;
    var title = exercise.title;
    var forceArray = exercise.forces;
    var percentDisplay = percents[page - 1];
    $('#pImg').attr('src', exercise.img);
    $('#pTitle').text(title);
    $('#instr').load(exercise.inst, null,
        //callback:
        function () {
            if (tutorial) {
                //mark tutorial tasks already completed
                for (var i = 0; i < completedHelpLevels.length; i++) {
                    var id = "#" + completedHelpLevels[i];
                    $(id).attr("src", "../assets/freebody/checkboxB.png");
                }
            }
        });
    $('#unknown').html(exercise.unk);
    $('#units').text(exercise.units);
    $('#testFeedback').text(percentDisplay);
    if (exercise.title === "Tutorial") {
        tutorial = true;
        $("#submit").hide();
        if (helpTracker !== null) {
            helpGroup.visible = true;
            helper.visible = true;
        }
    } else {
        tutorial = false;
        $("#submit").show();
        helpGroup.visible = false;
    }
    setUpForceBtns(forceArray);
}
function setUpForceBtns(btnArray) {
    var buttonBlock = game.add.graphics(0, 0);
    var buttonBG = game.add.graphics(0, 0);
    forceBtns = [];
    buttonBlock.beginFill(0xeae6de);
    buttonBlock.drawRect(game.world.centerX, game.world.centerY, 110, 160);
    buttonBlock.pivot.set(buttonBlock.width / 2, buttonBlock.height / 2);
    buttonBG.beginFill(0x000000, 0.5);
    buttonBG.drawRect(0, 0, game.width, game.height);
    arrowGroup = game.add.group();
    arrowGroup.add(buttonBG);
    arrowGroup.add(buttonBlock);
    forceBtns[0] = game.add.button(game.world.centerX, game.world.centerY - 60, 'forceBtns', function () { forceSelect(forceBtns[0]) }, this, 1, 0, 0);
    forceBtns[1] = game.add.button(game.world.centerX, game.world.centerY - 30, 'forceBtns', function () { forceSelect(forceBtns[1]) }, this, 1, 0, 0);
    forceBtns[2] = game.add.button(game.world.centerX, game.world.centerY, 'forceBtns', function () { forceSelect(forceBtns[2]) }, this, 1, 0, 0);
    forceBtns[3] = game.add.button(game.world.centerX, game.world.centerY + 30, 'forceBtns', function () { forceSelect(forceBtns[3]) }, this, 1, 0, 0);
    forceBtns[4] = game.add.button(game.world.centerX, game.world.centerY + 60, 'forceBtns', function () { forceSelect(forceBtns[4]) }, this, 1, 0, 0);
    for (var i = 0; i < 5; i++) {
        forceBtns[i].pivot.set(forceBtns[i].width / 2, forceBtns[i].height / 2);
        forceBtns[i].forceOut = true;
        forceBtns[i].id = btnArray[i];
        addBtnText(forceBtns[i], btnArray[i]);
        window.rich = forceBtns[i];
        arrowGroup.add(forceBtns[i]);
        arrowGroup.add(forceBtns[i].text);
    }
    arrowGroup.visible = false;
}
//GETTERS
function ansObj() {
    var ans = {};
    var arrows = fb.arrowArray;
    var value;
    for (var i = 0; i < arrows.length; i++) {
        value = arrows[i].degAngle.toString();
        if (arrows[i].mag > 0) {
            ans[arrows[i].fType] = value;
        }
    }
    return ans;
}
function rForce() {
    this.init = function () {
        this.zmag = 0;
        this.xmag = 0;
        this.ymag = 0;
        this.degAngle = 0;
    }
    this.update = function () {
        this.xmag = calcNetForce();
    }
}
function calcNetForce() {
    var nf = { "h": 0, "v": 0, "a": 0, "mag": 0 };
    var netAngle = 0;
    nf.h = 0;
    nf.v = 0;
    nf.mag = 0;
    for (var i = 0; i < fb.arrowArray.length; i++) {
        if (fb.arrowArray[i].mag > 0) {
            var h, v;
            h = fb.arrowArray[i].mag * Math.sin(fb.arrowArray[i].radAngle);
            v = fb.arrowArray[i].mag * Math.cos(fb.arrowArray[i].radAngle);
            nf.h += h;
            nf.v += v;
        }
    }
    if (fb.ghostArrowDisplay) {
        if (fb.ghostArrowDisplay.visible === true) {
            nf.h += fb.ghostArrowDisplay.mag * Math.sin(fb.ghostArrowDisplay.radAngle);
            nf.v += fb.ghostArrowDisplay.mag * Math.cos(fb.ghostArrowDisplay.radAngle);
        }
    };
    if (nf.h < 0.01 && nf.h > -0.01) { nf.h = 0 };
    if (nf.v < 0.02 && nf.v > -0.01) { nf.v = 0 };
    netAngle = Math.atan(nf.h / nf.v);
    if (nf.h < 0 && nf.v >= 0) {
        netAngle = (Math.PI / 2 * 3) + (Math.PI / 2 + netAngle);
    }
    if (nf.v < 0) {
        nf.a = (Math.PI / 2) + Math.abs(netAngle + Math.PI / 2);
    } else {
        nf.a = netAngle;
    }
    if (Math.abs(closestAngle(nf.a) - nf.a) < (Math.PI / 20)) {
        nf.a = closestAngle(nf.a);
    }
    nf.mag = Math.sqrt(Math.pow(nf.h, 2) + Math.pow(nf.v, 2));
    netForce = nf;
    return nf;
}
function getAngle(h, v) {
    var netAngle = Math.atan(h / v);
    if (h < 0 && v >= 0) {
        netAngle = (Math.PI / 2 * 3) + (Math.PI / 2 + netAngle);
    }

    return netAngle;
}
function getArrowByAngle2(a) {
    if (fb.rAxis.rotation == 0) {
    }

    var a2 = a;
    var returnArrow = fb.arrowArray[0];
    if (a2 == 2 * Math.PI && state !== "rotate") {
        a2 = 0;
    }
    for (var i = 0; i < fb.arrowArray.length; i++) {
        if (a2 == fb.arrowArray[i].radAngle && fb.hyp >= 20) {
            returnArrow = fb.arrowArray[i];
        }
    }
    return returnArrow;
}
function absAngle(angle) {
    for (var i = 0; i < fixedAngleArray.length; i++) {
        if (fixedAngleArray[i] === angle) {
            return true;
        }
    }
    return false;
}
var returnArrow1;
var returnArrow2;
function getArrowByAngle(a) {
    var a2 = a;
    var returnArrow = fb.arrowArray[0];
    if (fb.rAxis.rotation !== 0) {
        return getArrowByAngle2(a2);
    } else {
        var i = 0;
        if (a2 === 2 * Math.PI) {
            a2 = 0;
        }
        for (i; i < 4; i++) {
            if (a2 == fb.arrowArray[i].radAngle && fb.hyp >= 10) {
                returnArrow1 = fb.arrowArray[i];
                returnArrow = returnArrow1;
            }
        }
        i = 4
        for (i; i < fb.arrowArray.length; i++) {
            if (a2 == fb.arrowArray[i].radAngle && fb.hyp >= 10) {
                returnArrow2 = fb.arrowArray[i];
                returnArrow = returnArrow2;
            }
        }
        if (arrowWithMagFound(returnArrow1, returnArrow2)) {
            return returnArrowWithMag(returnArrow1, returnArrow2);
        }
    }
    return returnArrow;
}
function arrowWithMagFound(a1, a2) {
    if ((a1 != null && a1.mag > 0) || (a2 != null && a2.mag > 0)) {
        return true;
    }
    return false;
}
function returnArrowWithMag(a1, a2) {
    if (a1 != null && a1.mag > 0) {
        return a1;
    }
    return a2;
}
function getMagError(a, fb, worth) {
    var me = 0;
    var aLength = a.length;
    if (fb.majorForce == null) {
        if ((a[7].mag - a[6].mag) != (fb[7].mag - fb[6].mag)
            || (a[5].mag - a[4].mag) != (fb[5].mag - fb[4].mag)
            || (a[3].mag - a[2].mag) != (fb[3].mag - fb[2].mag)
            || (a[1].mag - a[0].mag != (fb[1].mag - fb[0].mag))
        ) { me += worth; }
    } else if (a[majorForce].mag != 2) {
        me += worth;
    }
    return me;
}
function closestAngle(a) {
    var closest = fixedAngleArray[0];
    for (var i = 1; i < fixedAngleArray.length; i++) {
        if (Math.abs(a - fixedAngleArray[i]) < Math.abs(a - closest)) {
            closest = fixedAngleArray[i];
        }
    }
    for (var i = 0; i < rotAngleArray.length; i++) {
        if (Math.abs(a - rotAngleArray[i]) < Math.abs(a - closest)) {
            closest = rotAngleArray[i];
        }
    }
    return closest;
}
function findAngle() {
    if (game.input.mousePointer.y < game.world.centerY) {
        if (game.input.mousePointer.x > game.world.centerX) {
            cAngle = (Math.atan((game.input.mousePointer.x - fb.forceCenter.x) / (fb.forceCenter.y - game.input.mousePointer.y)));
        } else {
            cAngle = 2 * Math.PI - Math.abs(Math.atan((game.input.mousePointer.x - fb.forceCenter.x) / (fb.forceCenter.y - game.input.mousePointer.y)));
        }
    } else {
        if (game.input.mousePointer.x > game.world.centerX) {
            cAngle = Math.PI - Math.abs(Math.atan((game.input.mousePointer.x - fb.forceCenter.x) / (fb.forceCenter.y - game.input.mousePointer.y)));
        } else {
            cAngle = Math.PI + Math.abs(Math.atan((game.input.mousePointer.x - fb.forceCenter.x) / (fb.forceCenter.y - game.input.mousePointer.y)));
        }
    }
    if (cAngle == 2 * Math.PI) {
        cAngle = 0;
    }
    cAngle = round(cAngle, (180 / Math.PI));
    return cAngle;
}
//SETTERS
function setUpRotHandle(rotH, angle) {
    rotH.rotation = angle;
    rotH.pivot.set(rotH.width / 2, rotH.height / 2);
    rotH.inputEnabled = true;
    rotH.visible = false;
    rotH.events.onInputDown.add(function () { rotHandleDown(rotH) }, this);
    rotH.events.onInputUp.add(function () { rotHandleUp(rotH) }, this);
    rotH.pos = angle;
    rotHandlesGroup.add(rotH);
}
function resetFBD() {
    $("#ans").val('');
    var arrayLength = fb.arrowArray.length;
    for (var i = 0; i < arrayLength; i++) {
        fb.arrowArray[i].fType = progress[page - 1][i].f;
        fb.arrowArray[i].mag = progress[page - 1][i].m;
        // fb.arrowArray[i].radAngle = progress[page - 1][i].r;
        if (progress[page - 1][i].f !== "") {
            fb.arrowArray[i].setFrames();
            drawArrow(fb.arrowArray[i], fb.arrowArray[i].radAngle, fb.arrowArray[i].mag * gp.magLength, 0x000000);
            fb.arrowArray[i].drawForce(0, fb.arrowArray[i].radAngle);
            fb.arrowArray[i].visible = true;
            fb.arrowArray[i].forces.visible = true;
            positionForces(fb.arrowArray[i]);
        } else {
            fb.arrowArray[i].visible = false;
            fb.arrowArray[i].forces.visible = false;
        }
    }
    fb.angleText.visible = false;
    fb.deg.visible = false;
    rotate(progress[page - 1][0].a);
    fb.currentRotHandle = fb.rotHandle;
    drawArc(progress[page - 1][0].a);
    if (progress[page - 1][0].a === 0) {
        fb.angleText.visible = false;
        fb.deg.visible = false;
    } else {
        fb.angleText.visible = true;
        fb.deg.visible = true;
    }
}
function createRotHandles() {
    rotHandlesGroup = game.add.group();
    fb.rotHandle = game.add.sprite(0, - fb.rotHyp, 'rotHandle');
    fb.rotHandle2 = game.add.sprite(fb.rotHyp, 0, 'rotHandle');
    fb.rotHandle3 = game.add.sprite(0, fb.rotHyp, 'rotHandle');
    fb.rotHandle4 = game.add.sprite(- fb.rotHyp, 0, 'rotHandle');
    setUpRotHandle(fb.rotHandle, 0);
    setUpRotHandle(fb.rotHandle2, Math.PI / 2);
    setUpRotHandle(fb.rotHandle3, Math.PI);
    setUpRotHandle(fb.rotHandle4, 3 * Math.PI / 2);
    rotHandlesGroup.handleSelected = false;
    rotHandlesGroup.pivot.set(0, 0);
    rotHandlesGroup.x = game.world.centerX;
    rotHandlesGroup.y = game.world.centerY;
}
function drawArrow(arrow, rot, hyp, color) {
    var aLength = hyp;
    arrow.clear();
    if (hyp < 10 && ((game.world.centerY - game.input.mousePointer.y) < 10)) {
        aLength = 0;
    } else {
        arrow.lineStyle(5, color);
        arrow.moveTo(game.width / 2, game.height / 2);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength);
        arrow.lineStyle(1, color);
        arrow.beginFill(color);
        arrow.moveTo(game.width / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2 - gp.arrowHead / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength - gp.arrowHead);
        arrow.lineTo(game.width / 2 + gp.arrowHead / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength);
        arrow.endFill();
        arrow.pivot.x = game.world.centerX;
        arrow.pivot.y = game.world.centerY;
        arrow.x = game.world.centerX;
        arrow.y = game.world.centerY;
        arrow.rotation = rot;
    }
}
function drawResultant(arrow, rot, mag, color) {
    arrow.clear();
    var aLength = 50 * mag;
    if (netForce.mag < (1 / snap)) {
        netForce.mag = 0;
        arrow.visible = false;
        aLength = 0;
    } else {
        arrow.visible = true;
        arrow.lineStyle(5, color);
        arrow.moveTo(game.width / 2, game.height / 2);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength);
        arrow.lineStyle(1, color);
        arrow.beginFill(color);
        arrow.moveTo(game.width / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2 - gp.arrowHead / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength - gp.arrowHead);
        arrow.lineTo(game.width / 2 + gp.arrowHead / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength);
        arrow.endFill();
        arrow.pivot.x = game.world.centerX;
        arrow.pivot.y = game.world.centerY;
        arrow.x = game.world.centerX;
        arrow.y = game.world.centerY;
        arrow.rotation = rot;
    }
}
//BOOLEANS
function arrowHere() {
    if (fb.hyp < 30) { return true }
    if (getArrowByAngle(closestAngle(findAngle())) != null) {
        if (getArrowByAngle(closestAngle(findAngle())).mag > 0) { return true }
    }
    return false;
}
function yCheck(p, m) {
    if (Math.abs(p - m) < 10) {
        return true;
    }
    return false;
}
function set_currentArrow(a) {
    currentArrow = getArrowByAngle(a);
}
//EVENT HANDLING
function update() {
    if (menuMode === false) {
        var aLength = gp.arrowLength;
        var ca = closestAngle(findAngle());
        var nf;
        set_currentArrow(ca);
        fb.rotHandle.visible = false;
        fb.rotHandle2.visible = false;
        fb.rotHandle3.visible = false;
        fb.rotHandle4.visible = false;
        fb.handle.visible = false;
        if (arrowHere() && state !== "arrow") {
            fb.handle.visible = true;
        }
        if (fb.centerHandle.visible === false && currentArrow.mag !== 0 && state === null) {
            fb.hoverArrowDisplay.visible = true;
            fb.hoverArrowDisplay.mag = currentArrow.mag;
            fb.hoverArrowDisplay.degAngle = currentArrow.degAngle;
            drawArrow(fb.hoverArrowDisplay, ca, fb.hoverArrowDisplay.mag * gp.magLength, 0xFFFFFF);
        } else {
            fb.hoverArrowDisplay.visible = false;
        }
        if (fb.hyp < 30 && ((game.world.centerY - game.input.mousePointer.y) < 30)) {
            aLength = 0;
            fb.centerHandle.visible = true;
            if (state === "arrow") {
                fb.ghostArrowDisplay.visible = false;
            }
        } else {
            fb.centerHandle.visible = false;
            gp.arrowLength = fb.hyp;
            if (state === "arrow") {
                fb.ghostArrowDisplay.visible = true;
                if (fb.ghostArrowDisplay.mag >= 2) {
                    fb.ghostArrowDisplay.mag = 2;
                }
                gp.arrowLength = fb.ghostArrowDisplay.mag * gp.magLength;
            }
        }
        if (fb.hyp > 120) {
            fb.hoverArrowDisplay.visible = false;
            if (fb.hyp < (game.world.width / 2)) {
                if (currentArrow.compass == "N") {
                    fb.rotHandle.visible = true;
                } else if (currentArrow.compass == "E") {
                    fb.rotHandle2.visible = true;
                } else if (currentArrow.compass == "S") {
                    fb.rotHandle3.visible = true;
                } else {
                    fb.rotHandle4.visible = true;
                }
            }
        }
    }
    fb.hyp = Math.sqrt(Math.pow((game.world.centerY - game.input.mousePointer.y), 2) + Math.pow((game.input.mousePointer.x - game.world.centerX), 2));
    fb.handle.x = aLength * Math.sin(ca) + game.world.centerX;
    fb.handle.y = game.world.centerY - aLength * Math.cos(ca);
    if (fb.ghostArrowDisplay != null && state === "arrow") {
        var lastMag = fb.ghostArrowDisplay.mag;
        var lastForce = calcNetForce();
        var nextMag = fb.hyp / gp.magLength;
        var nextForce = calcNetForce();
        fb.ghostArrowDisplay.radAngle = currentArrow.radAngle;
        if (nextForce < 0.2) {
            fb.ghostArrowDisplay.mag = lastMag;
        }
        fb.ghostArrowDisplay.mag = nextMag;
        if (fb.ghostArrowDisplay.mag >= 2) {
            fb.ghostArrowDisplay.mag = 2;
        }
        drawArrow(fb.ghostArrowDisplay, ca, fb.ghostArrowDisplay.mag * gp.magLength, 0xffffff);
    }
    rotateHandle();
    setDegs();
    drawResultant(fb.rArrow, calcNetForce().a, calcNetForce().mag, 0xFF9900);
}
function rotateHandle() {
    var newRot;
    if (rotHandlesGroup.handleSelected == true) {
        if (fb.currentRotHandle.pos == 0) {
            newRot = findAngle();
        } else if (fb.currentRotHandle.pos == Math.PI / 2) {
            newRot = findAngle() - Math.PI / 2;
        } else if (fb.currentRotHandle.pos == Math.PI) {
            newRot = findAngle() - Math.PI;
        } else if (fb.currentRotHandle.pos == 3 * Math.PI / 2) {
            newRot = findAngle() - 3 * Math.PI / 2;
        }
        if (newRot >= 0 && newRot <= Math.PI / 2) {
            rotate(newRot);
        }
        if (newRot > 15 * Math.PI / 16 || newRot < Math.PI / 64) {
            rotate(0);
        }
        if (newRot > (Math.PI / 2 - Math.PI / 64) && newRot < (Math.PI / 2 + Math.PI / 64)) {
            rotate((Math.PI / 2) - Math.PI / 180);
        }
    }
}
function handleCentered() {
    return (fb.handle.x === game.world.centerX && fb.handle.y === game.world.centerY);
}
function snapTo(fr, to, test, factor) {
    calcNetForce();
    return to;
}
function round(num, factor) {
    return (Math.round(num * factor) / factor);
}
function setDegs() {
    var aa = fb.arrowArray;
    for (var i = 0; i < aa.length; i++) {
        aa[i].degAngle = Math.round(aa[i].radAngle * 180 / Math.PI);
    }
}
function handleDown() {
    var currentArrow = getArrowByAngle(closestAngle(findAngle()));
    state = "arrow";
    if (fb.handle.x == game.world.centerX && fb.handle.y == game.world.centerY) {
        fb.moveArrow = null;
        createArrow();
    } else if (currentArrow.mag != 0) {
        fb.moveArrow = currentArrow;
        fb.ghostArrowDisplay = game.add.graphics(0, 0);
        fb.ghostArrowDisplay.visible = true;
        fb.ghostArrowDisplay.mag = currentArrow.mag;
        fb.ghostArrowDisplay.fType = currentArrow.fType;
        fb.ghostArrowDisplay.radAngle = currentArrow.radAngle;
        drawArrow(fb.ghostArrowDisplay, closestAngle(findAngle()), gp.arrowLength, 0xffffff);
        currentArrow.hide(false);
    }
}
function set_cAngle() {
    cAngle = round(closestAngle(findAngle()), (180 / Math.PI));
}
function handleUp() {
    state = null;
    fb.ghostArrowDisplay.mag = 0;
    set_cAngle();
    if (fb.ghostArrowDisplay != null) {
        if (fb.handle.x === game.world.centerX && fb.handle.y === game.world.centerY) {
            fb.ghostArrowDisplay.mag = 0;
            drawArrow(fb.ghostArrowDisplay, 0, 0);
            if (fb.moveArrow !== null) {
                fb.moveArrow.fType = "";
            }
        } else {
            currentArrow.setForce();
            currentArrow.visible = true;
            drawArrow(currentArrow, cAngle, gp.arrowLength, 0x000000);
            //currentArrow = getArrowByAngle(closestAngle(findAngle()));
            positionForces(currentArrow);
            if (fb.moveArrow == null) {
                state = "menu";
                showForceMenu();
            } else {
                currentArrow.fType = fb.moveArrow.fType;
                currentArrow.visible = true;
                currentArrow.setFrames();
                currentArrow.forces.visible = true;
            }
        }
        fb.ghostArrowDisplay.destroy();
    }
    fb.moveArrow = null;
    removeUnusedTypes();
    drawResultant(fb.rArrow, calcNetForce().a, calcNetForce().mag, 0xFF9900);
    if (tutorial) {
        tutorialMark();
    }

}
var arrowCount1;
var arrowCount2;
function positionForces(arrow) {
    if (arrow.axis == "abs") {
        arrow.forces.x = (fDiff + arrow.mag * gp.magLength) * Math.sin(arrow.radAngle) + game.world.centerX;
        arrow.forces.y = game.world.centerY - (fDiff + arrow.mag * gp.magLength) * Math.cos(arrow.radAngle);
    } else {
        arrow.forces.x = (fDiff + arrow.mag * gp.magLength) * Math.sin(arrow.radAngle - fb.rAxis.rotation) + game.world.centerX;
        arrow.forces.y = game.world.centerY - (fDiff + arrow.mag * gp.magLength) * Math.cos(arrow.radAngle - fb.rAxis.rotation);
    }
}
function tutorialMark() {
    if (helpTracker === "t_addArrow") {
        if (fb.arrowArray[6].degAngle === 180 && fb.arrowArray[6].mag > 0) {
            $('#t_addArrow').attr("src", "../assets/freebody/checkboxB.png");
            completedHelpLevels.push(helpLevels[0]);
            helpLevels.shift();
            helpTracker = helpLevels[0];
            updateHelp();
        }
    };
    if (helpTracker === "t_rotate") {
        if (Math.round(fb.rAxis.rotation * 180 / Math.PI) === 60) {
            $("#t_rotate").attr("src", "../assets/freebody/checkboxB.png");
            completedHelpLevels.push(helpLevels[0]);
            helpLevels.shift();
            helpTracker = helpLevels[0];
            updateHelp();
        }
    };
    if (helpTracker === "t_addArrow2") {
        if (fb.arrowArray[0].degAngle === 60 && fb.arrowArray[0].mag > 0) {
            $("#t_addArrow2").attr("src", "../assets/freebody/checkboxB.png");
            completedHelpLevels.push(helpLevels[0]);
            helpLevels.shift();
            helpTracker = helpLevels[0];
            updateHelp();
        }
    };
    if (helpTracker === "t_netForce" && netForce.a === Math.PI / 2) {
        arrowCount1 = 0;
        $("#t_netForce").attr("src", "../assets/freebody/checkboxB.png");
        completedHelpLevels.push(helpLevels[0]);
        for (var i = 0; i < fb.arrowArray.length; i++) {
            if (fb.arrowArray[i].mag > 0) {
                arrowCount1++;
            }
        }
        helpLevels.shift();
        helpTracker = helpLevels[0];
        updateHelp();
    };
    if (helpTracker === "t_removeArrow") {
        arrowCount2 = 0;
        for (var i = 0; i < fb.arrowArray.length; i++) {
            if (fb.arrowArray[i].mag > 0) {
                arrowCount2++;
            }
        }
        if (arrowCount2 < arrowCount1) {
            $("#t_removeArrow").attr("src", "../assets/freebody/checkboxB.png");
            completedHelpLevels.push(helpLevels[0]);
            helpTracker = null;
            var feedback = document.getElementById("feedback");
            feedback.style.display = "block";
            $("#percent").text("Tutorial Complete!");
            $("#hint").text("If you need another refresher, the HELP menu covers all the basics.")
            updateHelp();
        }
    };
};
function removeUnusedTypes() {
    for (var i = 0; i < fb.arrowArray.length; i++) {
        if (fb.arrowArray[i].mag === 0) {
            fb.arrowArray[i].fType = "";
        }
    }
}
function showForceMenu() {
    menuMode = true;
    state = "menu";
    arrowGroup.visible = true;
    for (var i = 0; i < forceBtns.length; i++) {
        forceBtns[i].text.visible = true;
    }
}
function forceSelect(btn) {
    arrowGroup.visible = false;
    currentArrow.forces.visible = true;
    currentArrow.fType = btn.id;
    currentArrow.setFrames();
    menuMode = false;
    state = null;
    if (tutorial) {
        tutorialMark();
    }
}
function rotHandleDown(h) {
    state = "rotate";
    rotHandlesGroup.handleSelected = true;
    fb.currentRotHandle = h;
}
function rotHandleUp(h) {
    state = null;
    rotHandlesGroup.handleSelected = false;
    fb.currentRotHandle = "";
    drawResultant(fb.rArrow, calcNetForce().a, calcNetForce().mag, 0xFF9900);
    if (tutorial) {
        tutorialMark();
    }
}
function up() {
    out();
}
function down() {
    out();
}
//MATH
function angleConvert(angle) {
    var rtnAngle;
    if (angle < 0) {
        rtnAngle = 2 * Math.PI - game.math.degToRad(angle);
    } else { rtnAngle = game.math.degToRad(angle) }
    return rtnAngle;
}
function Menu(id, exs, mitems, titles) {
    this.init = function () {
        $('#dropdown' + id).html();
        for (var i = 0; i < exercises.length; i++) {
            $('#dropdown' + id).append("<button onclick=gotoPage(" + i + ") class='menuBtn'><img src=" + mitems[i] + " style='width:90px' title='" + titles[i] + "'></img><br><span class='percentBtn' id='percent" + exs[i] + "'></span></button>");
        }
    }
}
function gotoPage(i) {

    saveProgress(page);
    page = i + 1;
    setUpExercise();
    resetFBD();
}
function saveProgress(p) {
    for (var i = 0; i < fb.arrowArray.length; i++) {
        progress[p - 1][i].a = fb.arrowArray[i].radAngle;
        progress[p - 1][i].m = fb.arrowArray[i].mag;
        progress[p - 1][i].f = fb.arrowArray[i].fType;
    };
}
function setUpMenus() {
    var mainMenu;
    var titles = [];
    var thumbnails = [];
    var ids = [];
    for (var i = 0; i < exercises.length; i++) {
        titles.push(json.exercises[exercises[i] - 1].title);
        thumbnails.push(json.exercises[exercises[i] - 1].thumb);
        ids.push(exercises[i] - 1);
    }
    /*
    for (var i = 0; i < json.exercises.length; i++) {
        titles.push(json.exercises[i].title);
    }
    for (var i = 0; i < json.exercises.length; i++) {
        thumbnails.push(json.exercises[i].img)
    }
    */
    mainMenu = new Menu("Main", ids, thumbnails, titles);
    mainMenu.init();
    if (exercises.length > 1) {
        toggleMenu("Main");
    } else {
        document.getElementById("exs-menu").remove();
        document.getElementById("prev").remove();
        document.getElementById("next").remove();
    }
}
function toggleMenu(id) {
    document.getElementById("dropdown" + id).classList.toggle("show");
}
//JQUERY 
$(document).ready(function () {
    var feedback = document.getElementById("feedback");
    var help = document.getElementById("help");
    var span = document.getElementsByClassName("close")[0];
    var json;
    $.getJSON("../json/freebody.json", function (data) {
        json = data;
    });
    $("#prev").click(function (event) {
        if (page > 1) {
            page--;
        }
        setUpExercise();
        resetFBD();
    })
    $("#next").click(function (event) {
        if (page < exercises.length) {
            page++;
        }
        setUpExercise();
        resetFBD();
    })
    $("#fb-close").click(function (event) {
        feedback.style.display = "none";
    })
    $("#submit").click(function (event) {
        var ao = ansObj();
        var so = json.exercises[exercises[page - 1] - 1].fb;
        var solnNetForce = json.exercises[exercises[page - 1] - 1].netForce;
        var ansNetForce = Math.round(netForce.a * 180 / Math.PI);
        var marked = Marker.mark_simple_obj(ao, so);
        var totalScore = 0;
        var magError = 0;
        var forceScoreSimple = forceScoreSimple = marked.percent.total;
        var hint = "hint";
        feedback.style.display = "block";
        /*
         $("#debug-output").html(
             '<strong> Force Score (simple): </strong>' + forceScoreSimple + '<br>' +
             '<strong> angles (simple): </strong>' + marked.percent.keys + '<br>' +
             '<strong> force types (simple): </strong>' + marked.percent.values + '<br>' +
             '<strong> kv (simple): </strong>' + marked.percent.kv + '<br>' +
             '<strong> Answer: </strong>' + JSON.stringify(ao) + '<br>' +
             '<strong> Solution: </strong>' + JSON.stringify(so)
         );
       */
        if (fb.rArrow.visible == false || netForce.mag == 0) {
            ansNetForce = null;
        }
        if (solnNetForce !== null) {
            solnNetForce = parseInt(solnNetForce);
        }
        if (ansNetForce !== solnNetForce) {
            magError += (marked.worth / 2);
        };
        totalScore = Math.round(forceScoreSimple - magError);
        if (totalScore < 0) { totalScore = 0 };
        if (totalScore == 100) {
            hint = "Great job!";
        } else if (forceScoreSimple === 100) {
            if (solnNetForce === null) {
                hint = "Make sure your net force is zero for this problem.";
            } else {
                hint = "Make sure your net force arrow (orange) is pointing in the direction of acceleration for the system.";
            }
        } else if (Object.keys(ansObj()).length > Object.keys(so).length) {
            hint = "You may be adding a force or two that you don't need...";
        } else if (Object.keys(ansObj()).length < Object.keys(so).length) {
            hint = "You are missing at least one force.";
        } else if (marked.percent.values === 100) {
            hint = "Your forces are correct, but are not all facing the right direction";
        } else {
            hint = "Not quite! Try again.";
        }
        $("#percent").text(Math.round(totalScore) + "%");
        $("#hint").html(hint);
        percents[page - 1] = Math.round(totalScore) + "%";
        var pId = exercises[page - 1] - 1;
        var percentId = "#percent" + pId;
        $(percentId).text(percents[page - 1]);
        $(percentId).prop("background-color", "#000000");
        $("#testFeedback").text(percents[page - 1]);
    });
});
//DEBUGGING
function render() {
    var aa = fb.arrowArray;
    var aaStr1 = "";
    var aaStr2 = "";
    var aaStr3 = "";
    var aaStr4 = "";
    /*
    game.debug.text("currentArrow: " + currentArrow.fType + " [" + currentArrow.mag + "] (" + currentArrow.radAngle + ")", 0, 40);
    game.debug.text("y: " + netForce.v, 0, 300);
    game.debug.text("x: " + netForce.h, 0, 320);
    game.debug.text("a: " + netForce.a, 0, 340);
    */
    /*
    for (var i = 0; i < aa.length; i += 4) {
        aaStr1 += aa[i].axis + " " + aa[i].degAngle + ": " + aa[i].fType + "(" + round(aa[i].mag, 10) + ")";
        aaStr2 += aa[i + 1].axis + " " + aa[i + 1].degAngle + ": " + aa[i + 1].fType + "(" + round(aa[i + 1].mag, 10) + ")";
        aaStr3 += aa[i + 2].axis + " " + aa[i + 2].degAngle + ": " + aa[i + 2].fType + "(" + round(aa[i + 2].mag, 10) + ")";
        aaStr4 += aa[i + 3].axis + " " + aa[i + 3].degAngle + ": " + aa[i + 3].fType + "(" + round(aa[i + 3].mag, 10) + ")";
    }
    game.debug.text(aaStr1, 0, 280);
    game.debug.text(aaStr2, 0, 300);
    game.debug.text(aaStr3, 0, 320);
    game.debug.text(aaStr4, 0, 340);
    if (fb.ghostArrowDisplay != null) {
        game.debug.text("Ghost Arrow: " + "[" + fb.ghostArrowDisplay.mag + "]", 10, 20);
    }
    game.debug.text("State: " + state, 10, 40);
    if (currentArrow != null) {
        game.debug.text("currentArrow: " + currentArrow.fType + "(" + currentArrow.degAngle + ") [" + currentArrow.mag + "]", 10, 60);
    }
    if (fb.moveArrow != null) {
        game.debug.text("mArrow: " + fb.moveArrow.fType + "(" + fb.moveArrow.degAngle + ") [" + fb.moveArrow.mag + "]", 10, 80);
    }
    */
    /*
        //Debugging displays
         game.debug.text("fb.N_rel_arrow_abs: " + fb.N_abs_arrow.fType + " // fb.N_rel_arrow_rel: " + fb.N_rel_arrow.fType, 10, 330);
         game.debug.text("fb.E_rel_arrow_abs: " + fb.E_abs_arrow.fType + " // fb.E_rel_arrow_rel: " + fb.E_rel_arrow.fType, 10, 350);
         game.debug.text("fb.S_rel_arrow_abs: " + fb.S_abs_arrow.fType + " // fb.S_rel_arrow_rel: " + fb.S_rel_arrow.fType, 10, 370);
         game.debug.text("fb.W_rel_arrow_abs: " + fb.W_abs_arrow.fType + " // fb.W_rel_arrow_rel: " + fb.W_rel_arrow.fType, 10, 390);   
 
        */
};