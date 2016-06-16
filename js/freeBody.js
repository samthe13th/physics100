'use strict'

var game = new Phaser.Game(350, 400, Phaser.CANVAS, 'container', { preload: preload, create: create, update: update, render: render }, true);

function preload() {
    game.load.spritesheet('arrowBtns', 'assets/freebody/btnSheet.png', 20, 20);
    game.load.spritesheet('forceBtns', 'assets/freebody/btnsBlank.png', 100, 30, 3);
    game.load.spritesheet('forces', 'assets/freebody/forceSheet.png', 40, 40, 9);
    game.load.spritesheet('rotateBtn', 'assets/freebody/rotateBtn.png', 50, 50, 3);
    game.load.image('handle', 'assets/freebody/handle.png', 30, 30);
    game.load.image('anchor', 'assets/freebody/anchor.png', 15, 15);
    game.load.image('deg', 'assets/freebody/deg.png', 10, 10);
    game.load.image('capture1', 'instr/diagrams/capture1.gif');
    game.load.image('rotHandle', 'assets/freebody/rotateHandle.png');
}

var page = 1;
var fDist = 100;
var group;
var box_width = 0;
var arrowLength = 50;
var magLength = 50;
var ahSide = 18;
var btnMargin = 20;
var btnWidth = 20;
var currentArrow;
var rotBtn;
var rotHandle;
var rotHandle2;
var rotHandle3;
var rotHandle4;
var rAxis;
var handle;
var graphicsGroup;
var hyp;
var testArrow;
var arrowArray;
var arrowID = 0;
var angleText;
var selectedArrow = { "fType": "" };
var deg;
var rotHyp;
var rotHandleOffset = 35;
var currentRotHandle = "";
var moveArrow = { "fType": "" };
var menuMode = false;
var forceBtns;
var arcGraphics;
var anchor;

//Creates a module (IFFE object) to contain freebody functions and variables!
var fb = (function() {
    alert("freebody module invoked");
    var nArrow, sArrow, wArrow, eArrow, nArrowAbs, sArrowAbs, wArrowAbs, eArrowAbs;
    var rFb = {};
    
    rFb.nArrow;
    rFb.sArrow;
    rFb.eArrow;
    rFb.wArrow;
    rFb.nArrowAbs;
    rFb.sArrowAbs;
    rFb.wArrowAbs;
    rFb.eArrowAbs;

    return rFb;
} ());

function ansArray() {
    var ans = [fb.nArrow, fb.sArrow, fb.wArrow, fb.eArrow, fb.nArrowAbs, fb.sArrowAbs, fb.wArrowAbs, fb.eArrowAbs];
    console.log("fb.nArrowAbs mag = " + fb.nArrowAbs.force);
    return ans;
}

function create() {
    selectedArrow.forces = game.add.sprite(0, 0, 'forces', 0);
    moveArrow.forces = game.add.sprite(0, 0, 'forces', 0);
    moveArrow.dir = "";
    arrowArray = [];
    rotHyp = game.world.height / 2 - rotHandleOffset;
    arcGraphics = game.add.graphics(0, 0);
    anchor = game.add.button(0, 0, 'anchor', createArrow, this, 0, 0, 0);
    anchor.anchor.set(0.5);
    anchor.x = game.world.centerX;
    anchor.y = game.world.centerY;
    handle = game.add.sprite(0, 0, 'handle', 0);
    handle.anchor.set(0.5);
    handle.inputEnabled = true;
    handle.events.onInputDown.add(handleDown, this);
    handle.events.onInputUp.add(handleUp, this);

    createRotHandle();
    createAxis();

    var graphics = game.add.graphics(game.world.centerX, game.world.centerY);
    graphics.lineStyle(3, 0x000000);
    graphics.drawRect(-box_width / 2, -box_width / 2, box_width, box_width);
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

    fb.nArrow.forces = game.add.sprite(anchor.x, anchor.y - fDist, 'forces', 0);
    fb.sArrow.forces = game.add.sprite(anchor.x, anchor.y + fDist, 'forces', 0);
    fb.wArrow.forces = game.add.sprite(anchor.x - fDist, anchor.y, 'forces', 0);
    fb.eArrow.forces = game.add.sprite(anchor.x + fDist, anchor.y, 'forces', 0);
    fb.nArrow.forces.pivot.set(fb.nArrow.forces.width / 2, fb.nArrow.forces.height / 2);
    fb.sArrow.forces.pivot.set(fb.sArrow.forces.width / 2, fb.sArrow.forces.height / 2);
    fb.wArrow.forces.pivot.set(fb.wArrow.forces.width / 2, fb.wArrow.forces.height / 2);
    fb.eArrow.forces.pivot.set(fb.eArrow.forces.width / 2, fb.eArrow.forces.height / 2);

    fb.nArrowAbs.forces = game.add.sprite(anchor.x, anchor.y - fDist, 'forces', 0);
    fb.nArrowAbs.forces.pivot.set(fb.nArrowAbs.forces.width / 2, fb.nArrowAbs.forces.height / 2);
    fb.sArrowAbs.forces = game.add.sprite(anchor.x, anchor.y + fDist, 'forces', 0);
    fb.sArrowAbs.forces.pivot.set(fb.sArrowAbs.forces.width / 2, fb.sArrowAbs.forces.height / 2);
    fb.wArrowAbs.forces = game.add.sprite(anchor.x - fDist, anchor.y, 'forces', 0);
    fb.wArrowAbs.forces.pivot.set(fb.wArrowAbs.forces.width / 2, fb.wArrowAbs.forces.height / 2);
    fb.eArrowAbs.forces = game.add.sprite(anchor.x + fDist, anchor.y, 'forces', 0);
    fb.eArrowAbs.forces.pivot.set(fb.eArrowAbs.forces.width / 2, fb.eArrowAbs.forces.height / 2);

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
    setUpInteractives();
    angleText = game.add.text(0, 0, "", { font: "16px Arial", weight: "bold", fill: "white", align: "center" });
    angleText.pivot.set(angleText.width / 2, angleText.height / 2);
    
        $.getJSON("json/freebody.json", function(data) {
        var json = data;
        setUpExercise(json);
    });

    window.graphics = graphics;
}

function setUpForceBtns(btnArray) {
    forceBtns = [];

    var buttonBlock = game.add.graphics(0, 0);
    buttonBlock.beginFill(0xeae6de);
    buttonBlock.drawRect(game.world.centerX, game.world.centerY, 110, 160);
    buttonBlock.pivot.set(buttonBlock.width / 2, buttonBlock.height / 2);

    var buttonBG = game.add.graphics(0, 0);
    buttonBG.beginFill(0x000000, 0.5);
    buttonBG.drawRect(0, 0, game.width, game.height);

    group = game.add.group();
    group.add(buttonBG);
    group.add(buttonBlock);

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
        group.add(forceBtns[i]);
        group.add(forceBtns[i].text);
    }

    group.visible = false;
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
    arrowArray.push(arrow);
    arrow.fType = "";
    arrow.force = 0;
}

function createAxis(axis) {
    var axis = game.add.graphics(0, 0);
    deg = game.add.sprite(100, 100, 'deg', 0);
    deg.visible = false;
    axis.lineStyle(1, 0xffffff, 0.2);
    axis.moveTo(game.world.centerX, 0);
    axis.lineTo(game.world.centerX, game.world.height);
    axis.moveTo(0, game.world.centerY);
    axis.lineTo(game.world.width, game.world.centerY);
    axis.visible = true;
    rAxis = game.add.graphics(0, 0);
    rAxis.lineStyle(1, 0xffffff, 0.60)
    rAxis.moveTo(game.world.centerX, -100);
    rAxis.lineTo(game.world.centerX, game.world.width + 100);
    rAxis.moveTo(-100, game.world.centerY);
    rAxis.lineTo(game.world.width + 100, game.world.centerY);
    rAxis.visible = true;
    rAxis.pivot.x = game.world.centerX;
    rAxis.pivot.y = game.world.centerY;
    rAxis.x = game.world.centerX;
    rAxis.y = game.world.centerY;
    rAxis.inputEnabled = true;
}

function angleConvert(angle) {
    var rtnAngle;
    if (angle < 0) {
        rtnAngle = 2 * Math.PI - game.math.degToRad(angle);
    } else { rtnAngle = game.math.degToRad(angle) }
    return rtnAngle;
}

function createArrow() {
    console.log("create arrow");
    currentArrow = game.add.graphics(0, 0);
    currentArrow.visible = true;
    currentArrow.ID = arrowID;
    arrowID++;
    drawArrow(currentArrow, findAngle(), 0, 0xFFFFFF);
}

function handleDown() {
    if (handle.x == game.world.centerX && handle.y == game.world.centerY) {
        moveArrow.fType = "";
        createArrow();
    } else if (getArrowByAngle(closestAngle(findAngle())).force != 0) {
        moveArrow = getArrowByAngle(closestAngle(findAngle()));
        console.log("HANLDE DOWN: findArrow.fType = " + getArrowByAngle(closestAngle(findAngle())).fType);
        console.log("HANDLE DOWN: moveArrow.dir = " + moveArrow.dir + ", force = " + moveArrow.force, ", fType = " + moveArrow.fType);
        getArrowByAngle(closestAngle(findAngle())).force = 0;
        getArrowByAngle(closestAngle(findAngle())).visible = false;
        getArrowByAngle(closestAngle(findAngle())).forces.frame = 0;

        currentArrow = game.add.graphics(0, 0);
        currentArrow.ID = arrowID;
        arrowID++;
        currentArrow.visible = true;

        drawArrow(currentArrow, closestAngle(findAngle()), arrowLength, 0xffffff);
    } else { console.log("no arrow here") }

}

function handleUp() {
    var cAngle = closestAngle(findAngle());
    if (currentArrow != null) {
        if (handle.x == game.world.centerX && handle.y == game.world.centerY) {
            currentArrow.force = 0;
            drawArrow(currentArrow, 0, 0);
        } else {
            if (cAngle == fb.nArrowAbs.radAngle || cAngle == 2 * Math.PI) {
                setForce(fb.nArrowAbs);
                fb.nArrowAbs.visible = true;
                drawArrow(fb.nArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.sArrowAbs.radAngle) {
                setForce(fb.sArrowAbs);
                fb.sArrowAbs.visible = true;
                drawArrow(fb.sArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.wArrowAbs.radAngle) {
                setForce(fb.wArrowAbs);
                fb.wArrowAbs.visible = true;
                drawArrow(fb.wArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.eArrowAbs.radAngle) {
                setForce(fb.eArrowAbs);
                fb.eArrowAbs.visible = true;
                drawArrow(fb.eArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.nArrow.radAngle) {
                setForce(fb.nArrow);
                fb.nArrow.visible = true;
                drawArrow(fb.nArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.eArrow.radAngle) {
                setForce(fb.eArrow);
                fb.eArrow.visible = true;
                drawArrow(fb.eArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.sArrow.radAngle) {
                setForce(fb.sArrow);
                fb.sArrow.visible = true;
                drawArrow(fb.sArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == fb.wArrow.radAngle) {
                setForce(fb.wArrow);
                fb.wArrow.visible = true;
                drawArrow(fb.wArrow, cAngle, arrowLength, 0x000000);
            }
            var fDiff = 38;
            selectedArrow = getArrowByAngle(closestAngle(findAngle()));
            if (selectedArrow.dir == "N abs" || selectedArrow.dir == "S abs" || selectedArrow.dir == "W abs" || selectedArrow.dir == "E abs") {
                selectedArrow.forces.x = (fDiff + arrowLength) * Math.sin(cAngle) + game.world.centerX;
                selectedArrow.forces.y = game.world.centerY - (fDiff + arrowLength) * Math.cos(cAngle);
            } else {
                selectedArrow.forces.x = (fDiff + arrowLength) * Math.sin(cAngle - rAxis.rotation) + game.world.centerX;
                selectedArrow.forces.y = game.world.centerY - (fDiff + arrowLength) * Math.cos(cAngle - rAxis.rotation);
            }
            if (selectedArrow.fType == "") {
                showForceMenu();
            } else {
                selectedArrow.fType = moveArrow.fType;
                selectedArrow.visible = true;
                setFrames(selectedArrow);
                console.log("selectedArrow frame: " + selectedArrow.forces.frame);
                selectedArrow.forces.visible = true;
            }
        }
        currentArrow.destroy();
        console.log('MOVE ARROW DIR = ' + moveArrow.dir);
        console.log('SELECTED ARROW DIR = ' + selectedArrow.dir + "SELECTED ARROW FORCE = " + selectedArrow.force);

    }
    if (moveArrow.dir == selectedArrow.dir) {
        moveArrow.fType = selectedArrow.fType
    } else {
        moveArrow.fType = "";
    }
}

function setFrames(arrow) {
    console.log("SET FRAMES // " + arrow.fType);
    if (arrow.fType == "Gravity") {
        arrow.forces.frame = 1;
    } else if (arrow.fType == "Normal") {
        arrow.forces.frame = 2;
    } else if (arrow.fType == "Push") {
        arrow.forces.frame = 3;
    } else if (arrow.fType == "A on B") {
        arrow.forces.frame = 4;
    } else if (arrow.fType == "B on A") {
        arrow.forces.frame = 5;
    } else if (arrow.fType == "Tension"){
        arrow.forces.frame = 6;
    } else if (arrow.fType == "Air"){
        arrow.forces.frame = 7;
    } else if (arrow.fType == "Friction"){
        arrow.forces.frame = 8;
    }
}

function setForce(arrow) {
    console.log("arrowLength = " + arrowLength);
    console.log("SETFORCE //// Set " + arrow.dir + " fType to " + moveArrow.fType);
    arrow.fType = moveArrow.fType;
    if (arrowLength == 100) {
        arrow.force = 2;
    } else if (arrowLength == 50) {
        arrow.force = 1;
    } else {
        arrow.force = 0;
    }
    console.log("arrow " + arrow.dir + " mag = " + arrow.force);
}

function getArrowByAngle(a) {
    var a2 = a;
    if (a2 == 2 * Math.PI) {
        a2 = 0;
    }
    for (var i = 0; i < arrowArray.length; i++) {
        if (a2 == arrowArray[i].radAngle) {
            return arrowArray[i];
        }
    }
    return null;
}

var rotHandles;
function createRotHandle() {
    rotHandles = game.add.group();
    rotHandle = game.add.sprite(0, - rotHyp, 'rotHandle');
    rotHandle2 = game.add.sprite(rotHyp, 0, 'rotHandle');
    rotHandle3 = game.add.sprite(0, rotHyp, 'rotHandle');
    rotHandle4 = game.add.sprite(- rotHyp, 0, 'rotHandle');
    rotHandle2.rotation = Math.PI / 2;
    rotHandle3.rotation = Math.PI;
    rotHandle4.rotation = 3 * Math.PI / 2;
    rotHandle.pivot.set(rotHandle.width / 2, rotHandle.height / 2);
    rotHandle2.pivot.set(rotHandle.width / 2, rotHandle.height / 2)
    rotHandle3.pivot.set(rotHandle.width / 2, rotHandle.height / 2);
    rotHandle4.pivot.set(rotHandle.width / 2, rotHandle.height / 2);
    rotHandle.inputEnabled = true;
    rotHandle2.inputEnabled = true;
    rotHandle3.inputEnabled = true;
    rotHandle4.inputEnabled = true;
    rotHandle.visible = false;
    rotHandle2.visible = false;
    rotHandle3.visible = false;
    rotHandle4.visible = false;
    rotHandle.events.onInputDown.add(function() { rotHandleDown(rotHandle) }, this);
    rotHandle2.events.onInputDown.add(function() { rotHandleDown(rotHandle2) }, this);
    rotHandle3.events.onInputDown.add(function() { rotHandleDown(rotHandle3) }, this);
    rotHandle4.events.onInputDown.add(function() { rotHandleDown(rotHandle4) }, this);
    rotHandle.events.onInputUp.add(function() { rotHandleUp(rotHandle) }, this);
    rotHandle2.events.onInputUp.add(function() { rotHandleUp(rotHandle2) }, this);
    rotHandle3.events.onInputUp.add(function() { rotHandleUp(rotHandle3) }, this);
    rotHandle4.events.onInputUp.add(function() { rotHandleUp(rotHandle4) }, this);
    rotHandle.pos = 0;
    rotHandle2.pos = Math.PI / 2;
    rotHandle3.pos = Math.PI;
    rotHandle4.pos = 3 * Math.PI / 2;
    rotHandles.add(rotHandle);
    rotHandles.add(rotHandle2);
    rotHandles.add(rotHandle3);
    rotHandles.add(rotHandle4);
    rotHandles.handleSelected = false;
    rotHandles.pivot.set(0, 0);
    rotHandles.x = game.world.centerX;
    rotHandles.y = game.world.centerY;
}

function rotHandleDown(h) {
    console.log("Rotate axis: " + findAngle());
    console.log("Rot handle btn DOWN");
    rotHandles.handleSelected = true;
    currentRotHandle = h;
    console.log("Current rot Handle = " + currentRotHandle.dir);
}

function rotHandleUp(h) {
    rotHandles.handleSelected = false;
    currentRotHandle = "";
    console.log("Rot handle btn UP");
}

function up() {
    console.log('button up', arguments);
    out();
}

function down() {
    console.log('button down');
    out();
}

function drawArrow(arrow, rot, hyp, color) {
    var aLength = arrowLength;
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
        arrow.lineTo(game.width / 2 - ahSide / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength - ahSide);
        arrow.lineTo(game.width / 2 + ahSide / 2, game.height / 2 - aLength);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength);
        arrow.endFill();
        arrow.pivot.x = game.world.centerX;
        arrow.pivot.y = game.world.centerY;
        arrow.x = game.world.centerX;
        arrow.y = game.world.centerY;
        arrow.rotation = rot;
    }

}

function yCheck(p, m) {
    if (Math.abs(p - m) < 10) {
        return true;
    }
    return false;
}

function setUpExercise(json) {
    var pImg = json.exercises[page - 1].img;
    var pGif = json.exercises[page - 1].gif;
    var title = "Exercise " + page + ": " + json.exercises[page - 1].title;
    var forceArray = json.exercises[page - 1].forces;
    $('#pTitle').text(title);
    $('#pImg').attr('src', pImg);
    $('#instr').load(json.exercises[page - 1].inst);
    $('#pGif').attr('src', pGif);
    $('#unknown').html(json.exercises[page - 1].unk);
    $('#units').text(json.exercises[page - 1].units);
    setUpForceBtns(forceArray);
}

function setUpInteractives() {
    var aa = ansArray();
    console.log(aa[0].fType);
}

function showForceMenu() {
    menuMode = true;
    group.visible = true;
    forceBtns[0].text.visible = true;
    forceBtns[1].text.visible = true;
    forceBtns[2].text.visible = true;
    forceBtns[3].text.visible = true;
    forceBtns[4].text.visible = true;
}

function forceSelect(btn) {
    console.log(btn.id);
    group.visible = false;
    console.log("fnc forceSelect // Selected Arrow = " + selectedArrow.dir)
    selectedArrow.forces.visible = true;
    selectedArrow.fType = btn.id;
    setFrames(selectedArrow);
    menuMode = false;
}

function update() {
    var aLength = arrowLength + 8;
    var ca = closestAngle(findAngle());
    var cArrow = getArrowByAngle(ca);
    if (menuMode == false) {
        rotHandle.visible = false;
        rotHandle2.visible = false;
        rotHandle3.visible = false;
        rotHandle4.visible = false;
        handle.visible = false;
        if (arrowHere()) {
            handle.visible = true;
        }
        if (hyp < 50 && ((game.world.centerY - game.input.mousePointer.y) < 50)) {
            aLength = 0;
        } else if (hyp > 90) {
            arrowLength = 100;
        } else {
            arrowLength = 50;
        }

        if (hyp > 120) {
            if (rotHandles.rotation == 0) {
                if (cArrow.dir == "N abs") {
                    rotHandle.visible = true;
                } else if (cArrow.dir == "E abs") {
                    rotHandle2.visible = true;
                } else if (cArrow.dir == "S abs") {
                    rotHandle3.visible = true;
                } else {
                    rotHandle4.visible = true;
                }
            } else
                if (cArrow.dir == "N rel" || (cArrow.dir == "E abs" && rotHandles.rotation == Math.PI / 2)) {
                    rotHandle.visible = true;
                } else if (cArrow.dir == "E rel" || (cArrow.dir == "S abs" && rotHandles.rotation == Math.PI / 2)) {
                    rotHandle2.visible = true;
                } else if (cArrow.dir == "S rel" || (cArrow.dir == "W abs" && rotHandles.rotation == Math.PI / 2)) {
                    rotHandle3.visible = true;
                } else if (cArrow.dir == "W rel" || (cArrow.dir == "N abs" && rotHandles.rotation == Math.PI / 2)) {
                    rotHandle4.visible = true;
                } else { }

        }

    }

    hyp = Math.sqrt(Math.pow((game.world.centerY - game.input.mousePointer.y), 2) + Math.pow((game.input.mousePointer.x - game.world.centerX), 2));
    handle.x = aLength * Math.sin(ca) + game.world.centerX;
    handle.y = game.world.centerY - aLength * Math.cos(ca);
    if (currentArrow != null) {
        drawArrow(currentArrow, ca, hyp, 0xffffff);
    }

    if (rotHandles.handleSelected == true) {
        var newRot;
        if (currentRotHandle.pos == 0) {
            newRot = findAngle();
        } else if (currentRotHandle.pos == Math.PI / 2) {
            newRot = findAngle() - Math.PI / 2;
        } else if (currentRotHandle.pos == Math.PI) {
            newRot = findAngle() - Math.PI;
        } else if (currentRotHandle.pos == 3 * Math.PI / 2) {
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

function findAngle() {
    var cAngle;
    if (game.input.mousePointer.y < game.world.centerY) {
        if (game.input.mousePointer.x > game.world.centerX) {
            cAngle = (Math.atan((game.input.mousePointer.x - anchor.x) / (anchor.y - game.input.mousePointer.y)));
        } else {
            cAngle = 2 * Math.PI - Math.abs(Math.atan((game.input.mousePointer.x - anchor.x) / (anchor.y - game.input.mousePointer.y)));
        }
    } else {
        if (game.input.mousePointer.x > game.world.centerX) {
            cAngle = Math.PI - Math.abs(Math.atan((game.input.mousePointer.x - anchor.x) / (anchor.y - game.input.mousePointer.y)));
        } else {
            cAngle = Math.PI + Math.abs(Math.atan((game.input.mousePointer.x - anchor.x) / (anchor.y - game.input.mousePointer.y)));
        }
    }
    if (cAngle == 2 * Math.PI) {
        cAngle = 0;
    }
    return cAngle;
}

var pi = Math.PI;
var angleArray1 = [0, (pi / 2), pi, (3 * pi / 2), 2 * pi];
var angleArray2 = [0];

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

function rotate(rads) {
    if (rAxis.rotation == 0) {
        angleText.visible = false;
        fb.nArrow.visible = false;
        fb.sArrow.visible = false;
        fb.wArrow.visible = false;
        fb.eArrow.visible = false;
        fb.nArrow.force = 0;
        fb.sArrow.force = 0;
        fb.wArrow.force = 0;
        fb.eArrow.force = 0;
        fb.nArrow.fType = "";
        fb.sArrow.fType = "";
        fb.wArrow.fType = "";
        fb.eArrow.fType = "";
        fb.nArrow.forces.frame = 0;
        fb.sArrow.forces.frame = 0;
        fb.wArrow.forces.frame = 0;
        fb.eArrow.forces.frame = 0;
        deg.visible = false;
    } else {
        angleText.visible = true;
        deg.visible = true;
    }

    rAxis.rotation = rads;
    graphicsGroup.rotation = rads;
    rotHandles.rotation = rads;
    drawArc(rads);

    fb.nArrow.radAngle = rads;
    fb.nArrow.forces.rotation = -rads;
    fb.sArrow.forces.rotation = -rads;
    fb.wArrow.forces.rotation = -rads;
    fb.eArrow.forces.rotation = -rads;

    if (fb.nArrow.force > 0) {
        arrowLength = magLength * fb.nArrow.force;
        drawArrow(fb.nArrow, fb.nArrow.radAngle, magLength * fb.nArrow.force, 0x000000);
    }
    fb.eArrow.radAngle = rads + Math.PI / 2;
    if (fb.eArrow.force > 0) {
        arrowLength = magLength * fb.eArrow.force;
        drawArrow(fb.eArrow, fb.eArrow.radAngle, magLength * fb.eArrow.force, 0x000000);
    }
    fb.sArrow.radAngle = rads + Math.PI;
    if (fb.sArrow.force > 0) {
        arrowLength = magLength * fb.sArrow.force;
        drawArrow(fb.sArrow, fb.sArrow.radAngle, magLength * fb.sArrow.force, 0x000000);
    }
    fb.wArrow.radAngle = rads + 3 * Math.PI / 2;
    if (fb.wArrow.force > 0) {
        arrowLength = magLength * fb.wArrow.force;
        drawArrow(fb.wArrow, fb.wArrow.radAngle, magLength * fb.wArrow.force, 0x000000);
    }
    angleArray2 = [rads, rads + Math.PI / 2, rads + Math.PI, rads + 3 * Math.PI / 2];

}

function drawArc(rads) {
    arcGraphics.clear();
    arcGraphics.lineStyle(70, 0xFFFFFF, 0.70);
    arcGraphics.arc(game.world.centerX, game.world.centerY, 30, game.math.degToRad(-90) + currentRotHandle.pos, rads - Math.PI / 2 + currentRotHandle.pos, false);
    angleText.text = Math.round(Math.round(rads * 180 / Math.PI));
    angleText.x = 1.6 * magLength * Math.sin((rads / 2) + currentRotHandle.pos) + game.world.centerX - 10;
    angleText.y = game.world.centerY - 1.6 * magLength * Math.cos((rads / 2) + currentRotHandle.pos);
    deg.x = angleText.x + 20;
    deg.y = angleText.y - 10;
    if (Math.round(Math.round(rads * 180 / Math.PI)) > 99) {
        deg.x += 10;
    }
    if (Math.round(Math.round(rads * 180 / Math.PI)) < 10) {
        deg.x -= 10;
    }
}

function render() {
    //Debuggig displays
    
      /*
       game.debug.text("fb.nArrow Abs: " + fb.nArrowAbs.fType + " // fb.nArrow Rel: " + fb.nArrow.fType, 10, 330);
       game.debug.text("fb.eArrow Abs: " + fb.eArrowAbs.fType + " // fb.eArrow Rel: " + fb.eArrow.fType, 10, 350);
       game.debug.text("fb.sArrow Abs: " + fb.sArrowAbs.fType + " // fb.sArrow Rel: " + fb.sArrow.fType, 10, 370);
       game.debug.text("fb.wArrow Abs: " + fb.wArrowAbs.fType + " // fb.wArrow Rel: " + fb.wArrow.fType, 10, 390);
       
       game.debug.text("Move Arrow: " + moveArrow.fType, 10, 20);
     */
}

$(document).ready(function() {

    var feedback = document.getElementById("feedback");
    var json;
    var span = document.getElementsByClassName("close")[0];
        $.getJSON("json/freebody.json", function(data) {
        json = data;
    });

    span.onclick = function() {
        feedback.style.display = "none";
    }
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
        var fbHeader = document.getElementById("modal-header");
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

function resetFBD() {
    rotate(0);
    $("#ans").val('');
    var arrayLength = arrowArray.length;
    for (var i = 0; i < arrayLength; i++) {
        arrowArray[i].fType = "";
        arrowArray[i].force = 0;
        arrowArray[i].visible = false;
        arrowArray[i].forces.visible = false;
    }
    angleText.visible = false;
    deg.visible = false;
}

function arrowHere() {
    if (hyp < 20) {
        return true;
    }
    if (getArrowByAngle(closestAngle(findAngle())) != null) {

        if ((getArrowByAngle(closestAngle(findAngle())).force == 1 && hyp > 50 && hyp < 80)
            || (getArrowByAngle(closestAngle(findAngle())).force == 2 && hyp > 99)) {
            return true;
        }
    }
    return false;
}
