'use strict'
var game = new Phaser.Game(350, 400, Phaser.CANVAS, 'container', { preload: preload, create: create, update: update, render: render }, true);
var page = 1;
var menuMode = false;
var graphicsGroup;
var arrowGroup;
var rotHandlesGroup;
var arcGraphics;
var forceBtns;
var json;
var cAngle;
var cArrow;
var aId;
var gp = { fDist: 100, boxWidth: 0, arrowLength: 50, magLength: 50, arrowHead: 18, rotHandleOffset: 35 }
var fixedAngleArray = [0, (Math.PI / 2), Math.PI, (3 * Math.PI / 2), 2 * Math.PI];
var rotAngleArray = [0];
var dirArray = ["N", "S", "W", "E"];
var fb = (function () {
    var currentArrow, selectedArrow;
    var arrowArray = [];
    var rotHandle, rotHandle2, rotHandle3, rotHandle4, currentRotHandle;
    var angleText, deg, rAxis, forceCenter, handle, hyp, rotHyp;
    var rFb = {};
    rFb.selectedArrow = { "fType": "" };
    rFb.moveArrow = { "fType": "" };
    rFb.currentRotHandle = "";
    return rFb;
} ());

function preload() {
    game.load.spritesheet('arrowBtns', 'assets/freebody/btnSheet.png', 20, 20);
    game.load.spritesheet('forceBtns', 'assets/freebody/btnsBlank.png', 100, 30, 3);
    game.load.spritesheet('forces', 'assets/freebody/forceSheet.png', 40, 40, 9);
    game.load.spritesheet('rotateBtn', 'assets/freebody/rotateBtn.png', 50, 50, 3);
    game.load.image('handle', 'assets/freebody/handle.png', 30, 30);
    game.load.image('forceCenter', 'assets/freebody/anchor.png', 15, 15);
    game.load.image('deg', 'assets/freebody/deg.png', 10, 10);
    game.load.image('capture1', 'instr/diagrams/capture1.gif');
    game.load.image('rotHandle', 'assets/freebody/rotHandleRight.png');
}

function create() {
    aId = 1;
    fb.selectedArrow.forces = game.add.sprite(0, 0, 'forces', 0);
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
    $.getJSON("json/freebody.json", function (data) {
        json = data;
        setUpExercise();
        setUpMenus();
    });
    setDegs();
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
}

function createArrow() {
    fb.currentArrow = game.add.graphics(0, 0);
    fb.currentArrow.visible = true;
    draw_rel_arrow(fb.currentArrow, findAngle(), 0, 0xFFFFFF);
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
}

//GRAPHICS
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

function migrate() {
    console.log("migrate");
    if (fb.arrowArray[4].radAngle === 0) {
        for (var i = 0; i < fb.arrowArray.length; i++) {
            var a = fb.arrowArray[i];
            if (a.axis === "rel") {
                console.log("Migrating " + a.fType);
                fb.arrowArray[i - 4].fType = a.fType;
                fb.arrowArray[i - 4].mag = a.mag;
                a.fType = "";
                a.mag = 0;
            }
        }
    }
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
        arrow.fType = fb.moveArrow.fType;
        if (gp.arrowLength == 100) {
            arrow.mag = 2;
        } else if (gp.arrowLength == 50) {
            arrow.mag = 1;
        } else {
            arrow.mag = 0;
        }
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
            draw_rel_arrow(arrow, arrow.radAngle, gp.magLength * arrow.mag, 0x000000);
        }
    }
    fb.arrowArray.push(arrow);
    console.log("Rad: " + arrow.radAngle + " Deg: " + arrow.degAngle);
}

function setUpExercise() {
    var pImg = json.exercises[page - 1].img;
    var pGif = json.exercises[page - 1].gif;
    var title = "Exercise " + page + ": " + json.exercises[page - 1].title;
    var forceArray = json.exercises[page - 1].forces;
    $('#pTitle').text(title);
    $('#pImg').attr('src', pImg);
    $('#instr').load(json.exercises[page - 1].inst);
    $('#unknown').html(json.exercises[page - 1].unk);
    $('#units').text(json.exercises[page - 1].units);
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

function ansArray() {
    var ans = [fb.N_rel_arrow, fb.S_rel_arrow, fb.W_rel_arrow, fb.E_rel_arrow, fb.N_abs_arrow, fb.S_abs_arrow, fb.W_abs_arrow, fb.E_abs_arrow];
    return ans;
}

function ansObj() {
    var ans = {};
    var arrows = fb.arrowArray;
    for (var i = 0; i < arrows.length; i++) {
        if (arrows[i].mag > 0) {
            ans[arrows[i].degAngle] = {
                "fType": arrows[i].fType,
                "mag": arrows[i].mag
            }
        }
    }
    return ans;
}

function getArrowByAngle(a) {
    var a2 = a;
    var returnArrow = fb.arrowArray[0];
    if (a2 == 2 * Math.PI) {
        a2 = 0;
    }
    for (var i = 0; i < fb.arrowArray.length; i++) {
        if (a2 == fb.arrowArray[i].radAngle && fb.hyp >= 20) {
            returnArrow = fb.arrowArray[i];
        }
    }
    return returnArrow;
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
    rotate(0);
    $("#ans").val('');
    var arrayLength = fb.arrowArray.length;
    for (var i = 0; i < arrayLength; i++) {
        fb.arrowArray[i].fType = "";
        fb.arrowArray[i].mag = 0;
        fb.arrowArray[i].visible = false;
        fb.arrowArray[i].forces.visible = false;
    }
    fb.angleText.visible = false;
    fb.deg.visible = false;
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

function draw_rel_arrow(arrow, rot, hyp, color) {
    var aLength = gp.arrowLength;
    arrow.clear();
    if (hyp < 50 && ((game.world.centerY - game.input.mousePointer.y) < 50)) {
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

//BOOLEANS
function arrowHere() {
    if (fb.hyp < 20) { return true }
    if (getArrowByAngle(closestAngle(findAngle())) != null) {
        if ((getArrowByAngle(closestAngle(findAngle())).mag == 1 && fb.hyp > 50 && fb.hyp < 80)
            || (getArrowByAngle(closestAngle(findAngle())).mag == 2 && fb.hyp > 99)) { return true }
    } return false;
}

function yCheck(p, m) {
    if (Math.abs(p - m) < 10) {
        return true;
    }
    return false;
}

function set_cArrow(a) {
    cArrow = getArrowByAngle(a);
}

//EVENT HANDLING
function update() {
    var aLength = gp.arrowLength + 8;
    var ca = closestAngle(findAngle());
    set_cArrow(ca);
    if (menuMode == false) {
        fb.rotHandle.visible = false;
        fb.rotHandle2.visible = false;
        fb.rotHandle3.visible = false;
        fb.rotHandle4.visible = false;
        fb.handle.visible = false;
        if (arrowHere()) {
            fb.handle.visible = true;
        }
        if (fb.hyp < 50 && ((game.world.centerY - game.input.mousePointer.y) < 50)) {
            aLength = 0;
        } else if (fb.hyp > 90) {
            gp.arrowLength = 100;
        } else {
            gp.arrowLength = 50;
        }

        if (fb.hyp > 120) {
            if (cArrow.compass == "N") {
                fb.rotHandle.visible = true;
            } else if (cArrow.compass == "E") {
                fb.rotHandle2.visible = true;
            } else if (cArrow.compass == "S") {
                fb.rotHandle3.visible = true;
            } else {
                fb.rotHandle4.visible = true;
            }
        }
    }

    fb.hyp = Math.sqrt(Math.pow((game.world.centerY - game.input.mousePointer.y), 2) + Math.pow((game.input.mousePointer.x - game.world.centerX), 2));
    fb.handle.x = aLength * Math.sin(ca) + game.world.centerX;
    fb.handle.y = game.world.centerY - aLength * Math.cos(ca);
    if (fb.currentArrow != null) {
        draw_rel_arrow(fb.currentArrow, ca, fb.hyp, 0xffffff);
    }

    if (rotHandlesGroup.handleSelected == true) {
        var newRot;
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
    setDegs();
}

function setDegs() {
    var aa = fb.arrowArray;
    for (var i = 0; i < aa.length; i++) {
        aa[i].degAngle = Math.round(aa[i].radAngle * 180 / Math.PI);
    }
}

function handleDown() {
    var cArrow = getArrowByAngle(closestAngle(findAngle()));
    if (fb.handle.x == game.world.centerX && fb.handle.y == game.world.centerY) {
        fb.moveArrow.fType = "";
        createArrow();
    } else if (cArrow.mag != 0) {
        fb.moveArrow = cArrow;
        cArrow.hide(false);
        fb.currentArrow = game.add.graphics(0, 0);
        fb.currentArrow.visible = true;
        draw_rel_arrow(fb.currentArrow, closestAngle(findAngle()), gp.arrowLength, 0xffffff);
    }
}

function set_cAngle() {
    cAngle = closestAngle(findAngle());
}

function handleUp() {
    set_cAngle();
    var cArrow = getArrowByAngle(cAngle);
    console.log("cAngle: " + cArrow.radAngle + " / " + cArrow.degAngle);
    var fDiff = 38;
    if (fb.currentArrow != null) {
        if (fb.handle.x == game.world.centerX && fb.handle.y == game.world.centerY) {
            fb.currentArrow.mag = 0;
            draw_rel_arrow(fb.currentArrow, 0, 0);
        } else {
            cArrow.setForce();
            cArrow.visible = true;
            draw_rel_arrow(cArrow, cAngle, gp.arrowLength, 0x000000);
            fb.selectedArrow = getArrowByAngle(closestAngle(findAngle()));
            if (fb.selectedArrow.axis == "abs") {
                fb.selectedArrow.forces.x = (fDiff + gp.arrowLength) * Math.sin(cAngle) + game.world.centerX;
                fb.selectedArrow.forces.y = game.world.centerY - (fDiff + gp.arrowLength) * Math.cos(cAngle);
            } else {
                fb.selectedArrow.forces.x = (fDiff + gp.arrowLength) * Math.sin(cAngle - fb.rAxis.rotation) + game.world.centerX;
                fb.selectedArrow.forces.y = game.world.centerY - (fDiff + gp.arrowLength) * Math.cos(cAngle - fb.rAxis.rotation);
            }
            if (fb.selectedArrow.fType == "") {
                showForceMenu();
            } else {
                fb.selectedArrow.fType = fb.moveArrow.fType;
                fb.selectedArrow.visible = true;
                fb.selectedArrow.setFrames();
                fb.selectedArrow.forces.visible = true;
            }
        }
        fb.currentArrow.destroy();
    }
    if (fb.moveArrow.dir == fb.selectedArrow.dir) {
        fb.moveArrow.fType = fb.selectedArrow.fType
    } else {
        fb.moveArrow.fType = "";
    }
}

function showForceMenu() {
    menuMode = true;
    arrowGroup.visible = true;
    for (var i = 0; i < forceBtns.length; i++) {
        forceBtns[i].text.visible = true;
    }
}

function forceSelect(btn) {
    arrowGroup.visible = false;
    fb.selectedArrow.forces.visible = true;
    fb.selectedArrow.fType = btn.id;
    fb.selectedArrow.setFrames();
    menuMode = false;
}

function rotHandleDown(h) {
    rotHandlesGroup.handleSelected = true;
    fb.currentRotHandle = h;
}

function rotHandleUp(h) {
    rotHandlesGroup.handleSelected = false;
    fb.currentRotHandle = "";
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

function Menu(id, mitems) {
    this.init = function () {
        $('#dropdown' + id).html();
        for (var i = 0; i < mitems.length; i++) {
            $('#dropdown' + id).append("<button onclick=goto(" + i + ")>" + (i + 1) + ". " + mitems[i] + "</button>");
        }
    }
}

var goto = function (i) {
    page = i + 1;
    setUpExercise();
    toggleMenu("Main");
    resetFBD();
}

function setUpMenus() {
    var mainMenu;
    var titles = [];
    for (var i = 0; i < json.exercises.length; i++) {
        titles.push(json.exercises[i].title);
    }
    mainMenu = new Menu("Main", titles);
    mainMenu.init();
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

    Modal.init();
    Modal.open();

    $.getJSON("json/freebody.json", function (data) {
        json = data;
    });
    $("#testFeedback").click(function (event) {
        var aa = fb.arrowArray;
        var ans = ansObj();
        var aaStr = "";
        var op = "";
        setDegs();
        migrate();
        for (var k in ans) {
            op += ans.k + " ";
        }
        // alert(aaStr);
    })
    $("#prev").click(function (event) {
        if (page > 1) {
            page--;
        }
        setUpExercise();
        resetFBD();
    })
    $("#next").click(function (event) {
        if (page < json.exercises.length) {
            page++;
        }
        setUpExercise();
        resetFBD();
    })
    $("#fb-close").click(function (event) {
        feedback.style.display = "none";
    })
    $("#submit").click(function (event) {
        var percent = 100;
        var ans = $("#ans").val();
        var fbAns = true;
        var fbDir = true;
        var fbTypes = true;
        var numAns = true;
        var a = ansArray();
        var ao = ansObj()
        var title = json.exercises[page - 1].title;
        var fb = json.exercises[page - 1].fb;
        var aLength = a.length;
        var aWorth = 100 / 6;
        var fbTxt = "Feedback goes here";
        var params = ["fType", "mag"];
        /*
        console.log("a[0].type: " + a[0].fType);
        for (var i = 0; i < aLength; i++) {
            console.log("Ans " + i + " = " + a[i].fType + " " + a[i].mag + " Soln " + i + " = " + fb[i].type + " " + fb[i].mag);
            if (a[i].fType != fb[i].fType) {
                fbAns = false;
                percent -= aWorth;
            };
        };
        */
        var marked2 = Marker.mark_2d_obj(ao, fb, params);
        console.log("properties length: " + marked2.properties.length);
        feedback.style.display = "block";
        $("#percent").text("Total: " + Math.round(marked2.percent.total) + "%");
        for (var i = 0; i < marked2.properties.length; i++) {
            console.log("Property # " + i);
            var txt = "";
            if (marked2.properties[i] === "fType") {
                txt = "forces: ";
            } else {
                txt = "magnitude: "
            }
            $("#feedback-body").append("<p class='sub-percent'> Correct " + txt + marked2.percent.fType + "%</p>");
        }

        /*
         var marked = Marker.mark_array_of_objs(a, fb, parms);
         var feedback;
         if (marked.percent.total == 100) {
             feedback = marked.verbal.perfect;
         }
         if (marked.percent.total < 100) {
             feedback = marked.verbal.good;
         }
         if (marked.percent.total < 90) {
             feedback = marked.verbal.poor;
         }
         alert(feedback + "\n" + "Force type percent = " + marked.percent.fType
             + "\n" + "Magnitude percent = " + marked.percent.mag
             + "\n" + "Total percent = " + marked.percent.total);
 
         percent -= getMagError(a, fb, aWorth);
         if (fbAns && numAns == false) {
             fbTxt = "Not quite! Your freebody diagram is correct, but your final answer is not.";
         } else if (numAns && fbAns == false) {
             fbTxt = "Not quite! You got the final answer correct, but the free body diagram incorrect.";
         } else if (numAns == false && fbAns == false) {
             fbTxt = "Not quite.  Try again!";
         } else if (getMagError(a, fb, aWorth) > 0) {
             fbTxt = "Close! But check that your force magnitudes are correct (represented by thE_relative LENGTHS of your arrows)"
         }
         else {
             fbTxt = "Correct! Great job.";
         }
         if (percent < 0) {
             percent = 0;
         }
         $("#percent").text(Math.round(percent) + "%");
         $("#feedbackTxt").text(fbTxt);
         console.log("Percent2: " + percent);
         */
    });
});

//DEBUGGING
function render() {
    var aa = fb.arrowArray;
    var aaStr1 = "";
    var aaStr2 = "";
    var aaStr3 = "";
    var aaStr4 = "";
    for (var i = 0; i < aa.length; i += 4) {
        aaStr1 += aa[i].aId + " " + aa[i].axis + " " + aa[i].degAngle + ": " + aa[i].fType + " (" + aa[i].mag + ")";
        aaStr2 += aa[i + 1].aId + " " + aa[i + 1].axis + " " + aa[i + 1].degAngle + ": " + aa[i + 1].fType + " (" + aa[i + 1].mag + ")";
        aaStr3 += aa[i + 2].aId + " " + aa[i + 2].axis + " " + aa[i + 2].degAngle + ": " + aa[i + 2].fType + " (" + aa[i + 2].mag + ")";
        aaStr4 += aa[i + 3].aId + " " + aa[i + 3].axis + " " + aa[i + 3].degAngle + ": " + aa[i + 3].fType + " (" + aa[i + 3].mag + ")";
    }
    game.debug.text("Arrow here? " + arrowHere(), 0, 290);
    game.debug.text(cArrow.aId + ": " + cArrow.fType + ", mag = " + cArrow.mag, 0, 310);
    game.debug.text(aaStr1, 0, 330);
    game.debug.text(aaStr2, 0, 350);
    game.debug.text(aaStr3, 0, 370);
    game.debug.text(aaStr4, 0, 390);

    //Debugging displays
    /*
     game.debug.text("fb.N_rel_arrow_abs: " + fb.N_abs_arrow.fType + " // fb.N_rel_arrow_rel: " + fb.N_rel_arrow.fType, 10, 330);
     game.debug.text("fb.E_rel_arrow_abs: " + fb.E_abs_arrow.fType + " // fb.E_rel_arrow_rel: " + fb.E_rel_arrow.fType, 10, 350);
     game.debug.text("fb.S_rel_arrow_abs: " + fb.S_abs_arrow.fType + " // fb.S_rel_arrow_rel: " + fb.S_rel_arrow.fType, 10, 370);
     game.debug.text("fb.W_rel_arrow_abs: " + fb.W_abs_arrow.fType + " // fb.W_rel_arrow_rel: " + fb.W_rel_arrow.fType, 10, 390);   
     game.debug.text("Move Arrow: " + fb.moveArrow.fType, 10, 20);
   */
}