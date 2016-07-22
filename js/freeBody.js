'use strict'
var game = new Phaser.Game(350, 400, Phaser.CANVAS, 'container', { preload: preload, create: create, update: update, render: render }, true);
var page = 1;
var menuMode = false;
var graphicsGroup;
var arrowGroup;
var rotHandlesGroup;
var arcGraphics;
var forceBtns;
var gp = { fDist: 100, boxWidth: 0, arrowLength: 50, magLength: 50, arrowHead: 18, rotHandleOffset: 35 }
var angleArray1 = [0, (Math.PI / 2), Math.PI, (3 * Math.PI / 2), 2 * Math.PI];
var angleArray2 = [0];
var fb = (function() {
    var nArrow, sArrow, wArrow, eArrow, nArrowAbs, sArrowAbs, wArrowAbs, eArrowAbs, currentArrow, selectedArrow;
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
    game.load.image('rotHandle', 'assets/freebody/rotateHandle.png');
}

function create() {
    var graphics = game.add.graphics(game.world.centerX, game.world.centerY);

    fb.selectedArrow.forces = game.add.sprite(0, 0, 'forces', 0);
    fb.moveArrow.forces = game.add.sprite(0, 0, 'forces', 0);
    fb.moveArrow.dir = "";
    fb.arrowArray = [];
    fb.rotHyp = game.world.height / 2 - gp.rotHandleOffset;
    arcGraphics = game.add.graphics(0, 0);
    fb.forceCenter = game.add.button(0, 0, 'forceCenter', createArrow, this, 0, 0, 0);
    fb.forceCenter.anchor.set(0.5);
    fb.forceCenter.x = game.world.centerX;
    fb.forceCenter.y = game.world.centerY;
    fb.handle = game.add.sprite(0, 0, 'handle', 0);
    fb.handle.anchor.set(0.5);
    fb.handle.inputEnabled = true;
    fb.handle.events.onInputDown.add(handleDown, this);
    fb.handle.events.onInputUp.add(handleUp, this);

    createRotHandles();
    createAxis();

    graphics.lineStyle(3, 0x000000);
    graphics.drawRect(-gp.boxWidth / 2, -gp.boxWidth / 2, gp.boxWidth, gp.boxWidth);
    fb.nArrow = game.add.graphics(0, 0);
    fb.sArrow = game.add.graphics(0, 0);
    fb.wArrow = game.add.graphics(0, 0);
    fb.eArrow = game.add.graphics(0, 0);
    fb.nArrowAbs = game.add.graphics(0, 0);
    fb.sArrowAbs = game.add.graphics(0, 0);
    fb.wArrowAbs = game.add.graphics(0, 0);
    fb.eArrowAbs = game.add.graphics(0, 0);

    setUpArrow(fb.nArrowAbs, "N abs", 0);
    setUpArrow(fb.sArrowAbs, "S abs", Math.PI);
    setUpArrow(fb.wArrowAbs, "W abs", 3 * Math.PI / 2);
    setUpArrow(fb.eArrowAbs, "E abs", Math.PI / 2);
    setUpArrow(fb.nArrow, "N rel", 0);
    setUpArrow(fb.sArrow, "S rel", Math.PI);
    setUpArrow(fb.wArrow, "W rel", 3 * Math.PI / 2);
    setUpArrow(fb.eArrow, "E rel", Math.PI / 2);

    graphicsGroup = game.add.group();
    graphicsGroup.add(graphics);
    graphicsGroup.add(fb.nArrow.forces);
    graphicsGroup.add(fb.sArrow.forces);
    graphicsGroup.add(fb.wArrow.forces);
    graphicsGroup.add(fb.eArrow.forces);
    graphicsGroup.pivot.x = game.world.centerX;
    graphicsGroup.pivot.y = game.world.centerY;
    graphicsGroup.x = game.world.centerX;
    graphicsGroup.y = game.world.centerY;

    fb.angleText = game.add.text(0, 0, "", { font: "16px Arial", weight: "bold", fill: "white", align: "center" });
    fb.angleText.pivot.set(fb.angleText.width / 2, fb.angleText.height / 2);

    $.getJSON("json/freebody.json", function(data) {
        var json = data;
        setUpExercise(json);
    });
    window.graphics = graphics;
}

function createArrow() {
    fb.currentArrow = game.add.graphics(0, 0);
    fb.currentArrow.visible = true;
    drawArrow(fb.currentArrow, findAngle(), 0, 0xFFFFFF);
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
function rotate(rads) {
    if (fb.rAxis.rotation == 0) {
        fb.angleText.visible = false;
        for (var i = 0; i < 4; i++) {
            fb.arrowArray[i].hide(true)
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
    fb.nArrow.drawForce(rads, 0);
    fb.eArrow.drawForce(rads, Math.PI / 2);
    fb.sArrow.drawForce(rads, Math.PI);
    fb.wArrow.drawForce(rads, 3 * Math.PI / 2);

    ///*******************************TODO********************************////
    //Why is this array being reconstructed here? Does it need to be??
    angleArray2 = [rads, rads + Math.PI / 2, rads + Math.PI, rads + 3 * Math.PI / 2];
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

function setUpArrow(arrow, dir, radAngle) {
    arrow.dir = dir;
    arrow.radAngle = radAngle;
    fb.arrowArray.push(arrow);
    arrow.fType = "";
    arrow.force = 0;
    arrow.setForce = function() {
        this.fType = fb.moveArrow.fType;
        if (gp.arrowLength == 100) {
            this.force = 2;
        } else if (gp.arrowLength == 50) {
            this.force = 1;
        } else {
            this.force = 0;
        }
    }
    arrow.setFrames = function() {
        if (this.fType == "Weight") {
            this.forces.frame = 1;
        } else if (this.fType == "Normal") {
            this.forces.frame = 2;
        } else if (this.fType == "Push") {
            this.forces.frame = 3;
        } else if (this.fType == "A on B") {
            this.forces.frame = 4;
        } else if (this.fType == "B on A") {
            this.forces.frame = 5;
        } else if (this.fType == "Tension") {
            this.forces.frame = 6;
        } else if (this.fType == "Air") {
            this.forces.frame = 7;
        } else if (this.fType == "Friction") {
            this.forces.frame = 8;
        }
    }
    arrow.setForces = function() {
        if (this == fb.nArrow || this == fb.nArrowAbs) {
            this.forces = game.add.sprite(fb.forceCenter.x, fb.forceCenter.y - gp.fDist, 'forces', 0);
        } else if (this == fb.sArrow || this == fb.sArrowAbs) {
            this.forces = game.add.sprite(fb.forceCenter.x, fb.forceCenter.y + gp.fDist, 'forces', 0);
        } else if (this == fb.wArrow || this == fb.wArrowAbs) {
            this.forces = game.add.sprite(fb.forceCenter.x - gp.fDist, fb.forceCenter.y, 'forces', 0);
        } else if (this == fb.eArrow || this == fb.eArrowAbs) {
            this.forces = game.add.sprite(fb.forceCenter.x + gp.fDist, fb.forceCenter.y, 'forces', 0);
        }
        this.forces.pivot.set(this.forces.width / 2, this.forces.height / 2);
    }
    arrow.setForces();
    arrow.hide = function(zero) {
        this.visible = false;
        this.force = 0;
        this.forces.frame = 0;
        if (zero) {
            this.fType = "";
        }
    }
    arrow.drawForce = function(r, a) {
        this.forces.rotation = -r;
        this.radAngle = r + a;
        if (this.force > 0) {
            gp.arrowLength = gp.magLength * this.force;
            drawArrow(this, this.radAngle, gp.magLength * this.force, 0x000000);
        }
    }
}

function setUpExercise(json) {
    var pImg = json.exercises[page - 1].img;
    var pGif = json.exercises[page - 1].gif;
    var title = "Exercise " + page + ": " + json.exercises[page - 1].title;
    var forceArray = json.exercises[page - 1].forces;
    var mainMenu;
    var titles = [];
    
    for (var i = 0; i < json.exercises.length; i++){
        titles.push(json.exercises[i].title);
    }
    
    console.log("titles: " + titles);
    mainMenu = new Menu("Main", titles);
    mainMenu.init();
    $('#pTitle').text(title);
    $('#pImg').attr('src', pImg);
    $('#instr').load(json.exercises[page - 1].inst);
    // $('#pGif').attr('src', pGif);
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
    forceBtns[0] = game.add.button(game.world.centerX, game.world.centerY - 60, 'forceBtns', function() { forceSelect(forceBtns[0]) }, this, 1, 0, 0);
    forceBtns[1] = game.add.button(game.world.centerX, game.world.centerY - 30, 'forceBtns', function() { forceSelect(forceBtns[1]) }, this, 1, 0, 0);
    forceBtns[2] = game.add.button(game.world.centerX, game.world.centerY, 'forceBtns', function() { forceSelect(forceBtns[2]) }, this, 1, 0, 0);
    forceBtns[3] = game.add.button(game.world.centerX, game.world.centerY + 30, 'forceBtns', function() { forceSelect(forceBtns[3]) }, this, 1, 0, 0);
    forceBtns[4] = game.add.button(game.world.centerX, game.world.centerY + 60, 'forceBtns', function() { forceSelect(forceBtns[4]) }, this, 1, 0, 0);

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
    var ans = [fb.nArrow, fb.sArrow, fb.wArrow, fb.eArrow, fb.nArrowAbs, fb.sArrowAbs, fb.wArrowAbs, fb.eArrowAbs];
    return ans;
}

function getArrowByAngle(a) {
    var a2 = a;
    if (a2 == 2 * Math.PI) {
        a2 = 0;
    }
    for (var i = 0; i < fb.arrowArray.length; i++) {
        if (a2 == fb.arrowArray[i].radAngle) {
            return fb.arrowArray[i];
        }
    }
    return null;
}

function getMagError(a, fb, worth) {
    var me = 0;
    var aLength = a.length;
    if (fb.majorForce == null) {
        if ((a[7].force - a[6].force) != (fb[7].mag - fb[6].mag)
            || (a[5].force - a[4].force) != (fb[5].mag - fb[4].mag)
            || (a[3].force - a[2].force) != (fb[3].mag - fb[2].mag)
            || (a[1].force - a[0].force != (fb[1].mag - fb[0].mag))
        ) { me += worth; }
    } else if (a[majorForce].force != 2) {
        me += worth;
    }
    return me;
}

function closestAngle(a) {
    var closest = angleArray1[0];
    for (var i = 1; i < angleArray1.length; i++) {
        if (Math.abs(a - angleArray1[i]) < Math.abs(a - closest)) {
            closest = angleArray1[i];
        }
    }
    for (var i = 0; i < angleArray2.length; i++) {
        if (Math.abs(a - angleArray2[i]) < Math.abs(a - closest)) {
            closest = angleArray2[i];
        }
    }
    return closest;
}

function findAngle() {
    var cAngle;
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
    rotH.events.onInputDown.add(function() { rotHandleDown(rotH) }, this);
    rotH.events.onInputUp.add(function() { rotHandleUp(rotH) }, this);
    rotH.pos = angle;
    rotHandlesGroup.add(rotH);
}

function resetFBD() {
    rotate(0);
    $("#ans").val('');
    var arrayLength = fb.arrowArray.length;
    for (var i = 0; i < arrayLength; i++) {
        fb.arrowArray[i].fType = "";
        fb.arrowArray[i].force = 0;
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

function drawArrow(arrow, rot, hyp, color) {
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
    if (fb.hyp < 20) {
        return true;
    }
    if (getArrowByAngle(closestAngle(findAngle())) != null) {

        if ((getArrowByAngle(closestAngle(findAngle())).force == 1 && fb.hyp > 50 && fb.hyp < 80)
            || (getArrowByAngle(closestAngle(findAngle())).force == 2 && fb.hyp > 99)) {
            return true;
        }
    }
    return false;
}

function yCheck(p, m) {
    if (Math.abs(p - m) < 10) {
        return true;
    }
    return false;
}

//EVENT HANDLING
function update() {
    var aLength = gp.arrowLength + 8;
    var ca = closestAngle(findAngle());
    var cArrow = getArrowByAngle(ca);
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
            if (rotHandlesGroup.rotation == 0) {
                if (cArrow.dir == "N abs") {
                    fb.rotHandle.visible = true;
                } else if (cArrow.dir == "E abs") {
                    fb.rotHandle2.visible = true;
                } else if (cArrow.dir == "S abs") {
                    fb.rotHandle3.visible = true;
                } else {
                    fb.rotHandle4.visible = true;
                }
            } else
                if (cArrow.dir == "N rel" || (cArrow.dir == "E abs" && rotHandlesGroup.rotation == Math.PI / 2)) {
                    fb.rotHandle.visible = true;
                } else if (cArrow.dir == "E rel" || (cArrow.dir == "S abs" && rotHandlesGroup.rotation == Math.PI / 2)) {
                    fb.rotHandle2.visible = true;
                } else if (cArrow.dir == "S rel" || (cArrow.dir == "W abs" && rotHandlesGroup.rotation == Math.PI / 2)) {
                    fb.rotHandle3.visible = true;
                } else if (cArrow.dir == "W rel" || (cArrow.dir == "N abs" && rotHandlesGroup.rotation == Math.PI / 2)) {
                    fb.rotHandle4.visible = true;
                } else { }

        }

    }

    fb.hyp = Math.sqrt(Math.pow((game.world.centerY - game.input.mousePointer.y), 2) + Math.pow((game.input.mousePointer.x - game.world.centerX), 2));
    fb.handle.x = aLength * Math.sin(ca) + game.world.centerX;
    fb.handle.y = game.world.centerY - aLength * Math.cos(ca);
    if (fb.currentArrow != null) {
        drawArrow(fb.currentArrow, ca, fb.hyp, 0xffffff);
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
}

function handleDown() {
    var cArrow = getArrowByAngle(closestAngle(findAngle()));
    if (fb.handle.x == game.world.centerX && fb.handle.y == game.world.centerY) {
        fb.moveArrow.fType = "";
        createArrow();
    } else if (cArrow.force != 0) {
        fb.moveArrow = cArrow;
        cArrow.hide(false);
        fb.currentArrow = game.add.graphics(0, 0);
        fb.currentArrow.visible = true;
        drawArrow(fb.currentArrow, closestAngle(findAngle()), gp.arrowLength, 0xffffff);
    }
}

function handleUp() {
    var cAngle = closestAngle(findAngle());
    var cArrow = getArrowByAngle(cAngle);
    var fDiff = 38;
    if (fb.currentArrow != null) {
        if (fb.handle.x == game.world.centerX && fb.handle.y == game.world.centerY) {
            fb.currentArrow.force = 0;
            drawArrow(fb.currentArrow, 0, 0);
        } else {
            cArrow.setForce();
            cArrow.visible = true;
            drawArrow(cArrow, cAngle, gp.arrowLength, 0x000000);
            fb.selectedArrow = getArrowByAngle(closestAngle(findAngle()));
            if (fb.selectedArrow.dir == "N abs" || fb.selectedArrow.dir == "S abs" || fb.selectedArrow.dir == "W abs" || fb.selectedArrow.dir == "E abs") {
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

//JQUERY 
$(document).ready(function() {
    var feedback = document.getElementById("feedback");
    var help = document.getElementById("help");
    var json;
    var span = document.getElementsByClassName("close")[0];

    Modal.init();
    Modal.open();

    $.getJSON("json/freebody.json", function(data) {
        json = data;
    });
   
    $("#prev").click(function(event) {
        if (page > 1) {
            page--;
        }
        setUpExercise(json);
        resetFBD();
    })
    $("#next").click(function(event) {
        if (page < json.exercises.length) {
            page++;
        }
        setUpExercise(json);
        resetFBD();
    })
    $("#submit").click(function(event) {
        var percent = 100;
        var ans = $("#ans").val();
        var fbAns = true;
        var fbDir = true;
        var fbTypes = true;
        var numAns = true;
        var a = ansArray();
        var title = json.exercises[page - 1].title;
        var fb = json.exercises[page - 1].fb;
        var aLength = a.length;
        var aWorth = 100 / 6;
        var fbTxt = "Feedback goes here";
        var fbHeader = document.getElement("help-modal.header");
        for (var i = 0; i < aLength; i++) {
            console.log("Ans " + i + " = " + a[i].fType + " " + a[i].force + " Soln " + i + " = " + fb[i].type + " " + fb[i].mag);
            if (a[i].fType != fb[i].type) {
                fbAns = false;
                percent -= aWorth;
            };
        };
        if (json.exercises[page - 1].ans != ans) {
            var numAns = false;
            percent -= aWorth;
        };
        percent -= getMagError(a, fb, aWorth);
        if (fbAns && numAns == false) {
            fbTxt = "Not quite! Your freebody diagram is correct, but your final answer is not.";
        } else if (numAns && fbAns == false) {
            fbTxt = "Not quite! You got the final answer correct, but the free body diagram incorrect.";
        } else if (numAns == false && fbAns == false) {
            fbTxt = "Not quite.  Try again!";
        } else if (getMagError(a, fb, aWorth) > 0) {
            fbTxt = "Close! But check that your force magnitudes are correct (represented by the relative LENGTHS of your arrows)"
        }
        else {
            fbTxt = "Correct! Great job.";
        }
        if (percent < 0) {
            percent = 0;
        }
        $("#percent").text(Math.round(percent) + "%");
        feedback.style.display = "block";
        $("#feedbackTxt").text(fbTxt);
    });
});

//DEBUGGING
function render() {
    //Debugging displays
    /*
     game.debug.text("fb.nArrow Abs: " + fb.nArrowAbs.fType + " // fb.nArrow Rel: " + fb.nArrow.fType, 10, 330);
     game.debug.text("fb.eArrow Abs: " + fb.eArrowAbs.fType + " // fb.eArrow Rel: " + fb.eArrow.fType, 10, 350);
     game.debug.text("fb.sArrow Abs: " + fb.sArrowAbs.fType + " // fb.sArrow Rel: " + fb.sArrow.fType, 10, 370);
     game.debug.text("fb.wArrow Abs: " + fb.wArrowAbs.fType + " // fb.wArrow Rel: " + fb.wArrow.fType, 10, 390);   
     game.debug.text("Move Arrow: " + fb.moveArrow.fType, 10, 20);
   */
}