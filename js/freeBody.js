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
var fDist = 100;
var group;
var nArrow;
var sArrow;
var wArrow;
var eArrow;
var nArrowAbs;
var sArrowAbs;
var wArrowAbs;
var eArrowAbs;
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
var axis2;
var gBtn;
var nBtn;
var pushBtn;
var aBtn;
var bBtn;
var handle;
var graphicsGroup;
var hyp1;
var hyp2;
var testArrow;
var arrowArray;
var arrowID = 0;
var angleText;
var selectedArrow = { "fType": "" };
var deg;
var rotHyp;
var rotHandleOffset = 35;
var currentRotHandle = "";
var page = 1;
var moveArrow = { "fType": "" };
var menuMode = false;
var forceBtns;
var arcGraphics;
var anchor;

function ansArray() {
    var ans = [nArrow, sArrow, wArrow, eArrow, nArrowAbs, sArrowAbs, wArrowAbs, eArrowAbs];
    console.log("nArrowAbs mag = " + nArrowAbs.force);
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
    nArrow = game.add.graphics(0, 0);
    sArrow = game.add.graphics(0, 0);
    wArrow = game.add.graphics(0, 0);
    eArrow = game.add.graphics(0, 0);
    nArrowAbs = game.add.graphics(0, 0);
    sArrowAbs = game.add.graphics(0, 0);
    wArrowAbs = game.add.graphics(0, 0);
    eArrowAbs = game.add.graphics(0, 0);

    setUpArrow(nArrowAbs, "N abs", 0);
    setUpArrow(sArrowAbs, "S abs", Math.PI);
    setUpArrow(wArrowAbs, "W abs", 3 * Math.PI / 2);
    setUpArrow(eArrowAbs, "E abs", Math.PI / 2);
    setUpArrow(nArrow, "N rel", 0);
    setUpArrow(sArrow, "S rel", Math.PI);
    setUpArrow(wArrow, "W rel", 3 * Math.PI / 2);
    setUpArrow(eArrow, "E rel", Math.PI / 2);

    nArrow.forces = game.add.sprite(anchor.x, anchor.y - fDist, 'forces', 0);
    sArrow.forces = game.add.sprite(anchor.x, anchor.y + fDist, 'forces', 0);
    wArrow.forces = game.add.sprite(anchor.x - fDist, anchor.y, 'forces', 0);
    eArrow.forces = game.add.sprite(anchor.x + fDist, anchor.y, 'forces', 0);
    nArrow.forces.pivot.set(nArrow.forces.width / 2, nArrow.forces.height / 2);
    sArrow.forces.pivot.set(sArrow.forces.width / 2, sArrow.forces.height / 2);
    wArrow.forces.pivot.set(wArrow.forces.width / 2, wArrow.forces.height / 2);
    eArrow.forces.pivot.set(eArrow.forces.width / 2, eArrow.forces.height / 2);

    nArrowAbs.forces = game.add.sprite(anchor.x, anchor.y - fDist, 'forces', 0);
    nArrowAbs.forces.pivot.set(nArrowAbs.forces.width / 2, nArrowAbs.forces.height / 2);
    sArrowAbs.forces = game.add.sprite(anchor.x, anchor.y + fDist, 'forces', 0);
    sArrowAbs.forces.pivot.set(sArrowAbs.forces.width / 2, sArrowAbs.forces.height / 2);
    wArrowAbs.forces = game.add.sprite(anchor.x - fDist, anchor.y, 'forces', 0);
    wArrowAbs.forces.pivot.set(wArrowAbs.forces.width / 2, wArrowAbs.forces.height / 2);
    eArrowAbs.forces = game.add.sprite(anchor.x + fDist, anchor.y, 'forces', 0);
    eArrowAbs.forces.pivot.set(eArrowAbs.forces.width / 2, eArrowAbs.forces.height / 2);

    graphicsGroup = game.add.group();
    graphicsGroup.add(graphics);
    graphicsGroup.add(nArrow.forces);
    graphicsGroup.add(sArrow.forces);
    graphicsGroup.add(wArrow.forces);
    graphicsGroup.add(eArrow.forces);

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

/*
    var buttonBlock = game.add.graphics(0, 0);
    buttonBlock.beginFill(0xeae6de);
    buttonBlock.drawRect(game.world.centerX, game.world.centerY, 110, 160);
    buttonBlock.pivot.set(buttonBlock.width / 2, buttonBlock.height / 2);

    var buttonBG = game.add.graphics(0, 0);
    buttonBG.beginFill(0x000000, 0.5);
    buttonBG.drawRect(0, 0, game.width, game.height);

    gBtn = game.add.button(game.world.centerX, game.world.centerY - 60, 'forceBtns', function() { forceSelect(gBtn) }, this, 1, 0, 0);
    gBtn.pivot.set(gBtn.width / 2, gBtn.height / 2);
    pushBtn = game.add.button(game.world.centerX, game.world.centerY - 30, 'forceBtns', function() { forceSelect(pushBtn) }, this, 1, 0, 0);
    pushBtn.pivot.set(pushBtn.width / 2, pushBtn.height / 2);
    nBtn = game.add.button(game.world.centerX, game.world.centerY, 'forceBtns', function() { forceSelect(nBtn) }, this, 1, 0, 0);
    nBtn.pivot.set(nBtn.width / 2, nBtn.height / 2);
    aBtn = game.add.button(game.world.centerX, game.world.centerY + 30, 'forceBtns', function() { forceSelect(aBtn) }, this, 1, 0, 0);
    aBtn.pivot.set(aBtn.width / 2, aBtn.height / 2);
    bBtn = game.add.button(game.world.centerX, game.world.centerY + 60, 'forceBtns', function() { forceSelect(bBtn) }, this, 1, 0, 0);
    bBtn.pivot.set(bBtn.width / 2, bBtn.height / 2);

    gBtn.forceOut = true;
    pushBtn.forceOut = true;
    nBtn.forceOut = true
    aBtn.forceOut = true;
    bBtn.forceOut = true;

    gBtn.id = "g";
    nBtn.id = "n";
    pushBtn.id = "push";
    aBtn.id = "AonB";
    bBtn.id = "BonA";

    addBtnText(gBtn, "Gravity");
    addBtnText(pushBtn, "Push");
    addBtnText(nBtn, "Normal");
    addBtnText(aBtn, "A on B");
    addBtnText(bBtn, "B on A");

    window.rich = gBtn;
    window.rich = pushBtn;
    window.rich = nBtn;
    window.rich = aBtn;
    window.rich = bBtn;

    group = game.add.group();
    group.add(buttonBG);
    group.add(buttonBlock);
    group.add(gBtn);
    group.add(pushBtn);
    group.add(nBtn);
    group.add(aBtn);
    group.add(bBtn);
    group.add(gBtn.text);
    group.add(pushBtn.text);
    group.add(nBtn.text);
    group.add(aBtn.text);
    group.add(bBtn.text);
    group.visible = false;
    //arrowArray = [nArrowAbs, sArrowAbs, wArrowAbs, eArrowAbs, nArrow, sArrow, wArrow, eArrow];
*/
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
    axis2 = game.add.graphics(0, 0);
    axis2.lineStyle(1, 0xffffff, 0.60)
    axis2.moveTo(game.world.centerX, -100);
    axis2.lineTo(game.world.centerX, game.world.width + 100);
    axis2.moveTo(-100, game.world.centerY);
    axis2.lineTo(game.world.width + 100, game.world.centerY);
    axis2.visible = true;
    axis2.pivot.x = game.world.centerX;
    axis2.pivot.y = game.world.centerY;
    axis2.x = game.world.centerX;
    axis2.y = game.world.centerY;
    axis2.inputEnabled = true;
    axis2.events.onInputOver.add(over, this);
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
            if (cAngle == nArrowAbs.radAngle || cAngle == 2 * Math.PI) {
                setForce(nArrowAbs);
                nArrowAbs.visible = true;
                drawArrow(nArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == sArrowAbs.radAngle) {
                setForce(sArrowAbs);
                sArrowAbs.visible = true;
                drawArrow(sArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == wArrowAbs.radAngle) {
                setForce(wArrowAbs);
                wArrowAbs.visible = true;
                drawArrow(wArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == eArrowAbs.radAngle) {
                setForce(eArrowAbs);
                eArrowAbs.visible = true;
                drawArrow(eArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == nArrow.radAngle) {
                setForce(nArrow);
                nArrow.visible = true;
                drawArrow(nArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == eArrow.radAngle) {
                setForce(eArrow);
                eArrow.visible = true;
                drawArrow(eArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == sArrow.radAngle) {
                setForce(sArrow);
                sArrow.visible = true;
                drawArrow(sArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == wArrow.radAngle) {
                setForce(wArrow);
                wArrow.visible = true;
                drawArrow(wArrow, cAngle, arrowLength, 0x000000);
            }
            var fDiff = 38;
            selectedArrow = getArrowByAngle(closestAngle(findAngle()));
            if (selectedArrow.dir == "N abs" || selectedArrow.dir == "S abs" || selectedArrow.dir == "W abs" || selectedArrow.dir == "E abs") {
                selectedArrow.forces.x = (fDiff + arrowLength) * Math.sin(cAngle) + game.world.centerX;
                selectedArrow.forces.y = game.world.centerY - (fDiff + arrowLength) * Math.cos(cAngle);
            } else {
                selectedArrow.forces.x = (fDiff + arrowLength) * Math.sin(cAngle - axis2.rotation) + game.world.centerX;
                selectedArrow.forces.y = game.world.centerY - (fDiff + arrowLength) * Math.cos(cAngle - axis2.rotation);
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
    //handle.isDown = true;
    console.log("Rot handle btn DOWN");
    rotHandles.handleSelected = true;
    currentRotHandle = h;
    console.log("Current rot Handle = " + currentRotHandle.dir);
}

function rotHandleUp(h) {
    //handle.isDown = false;
    rotHandles.handleSelected = false;
    currentRotHandle = "";
    console.log("Rot handle btn UP");
}

function up() {
    console.log('button up', arguments);
    out();
}

function over() {
    console.log('button over');
}

function out() {
    console.log('button out');
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
        if (hyp2 < 50 && ((game.world.centerY - game.input.mousePointer.y) < 50)) {
            aLength = 0;
        } else if (hyp2 > 90) {
            arrowLength = 100;
        } else {
            arrowLength = 50;
        }

        if (hyp2 > 120) {
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

    hyp2 = Math.sqrt(Math.pow((game.world.centerY - game.input.mousePointer.y), 2) + Math.pow((game.input.mousePointer.x - game.world.centerX), 2));
    handle.x = aLength * Math.sin(ca) + game.world.centerX;
    handle.y = game.world.centerY - aLength * Math.cos(ca);
    if (currentArrow != null) {
        drawArrow(currentArrow, ca, hyp2, 0xffffff);
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
    if (axis2.rotation == 0) {
        angleText.visible = false;
        nArrow.visible = false;
        sArrow.visible = false;
        wArrow.visible = false;
        eArrow.visible = false;
        nArrow.force = 0;
        sArrow.force = 0;
        wArrow.force = 0;
        eArrow.force = 0;
        nArrow.fType = "";
        sArrow.fType = "";
        wArrow.fType = "";
        eArrow.fType = "";
        nArrow.forces.frame = 0;
        sArrow.forces.frame = 0;
        wArrow.forces.frame = 0;
        eArrow.forces.frame = 0;
        // nArrow.forces.visible = false;
        //sArrow.forces.visbile = false;
        //wArrow.forces.visible = false;
        //eArrow.forces.visible = false;
        deg.visible = false;
    } else {
        angleText.visible = true;
        deg.visible = true;
    }

    axis2.rotation = rads;
    graphicsGroup.rotation = rads;
    rotHandles.rotation = rads;
    drawArc(rads);

    nArrow.radAngle = rads;
    nArrow.forces.rotation = -rads;
    sArrow.forces.rotation = -rads;
    wArrow.forces.rotation = -rads;
    eArrow.forces.rotation = -rads;

    if (nArrow.force > 0) {
        arrowLength = magLength * nArrow.force;
        drawArrow(nArrow, nArrow.radAngle, magLength * nArrow.force, 0x000000);
    }
    eArrow.radAngle = rads + Math.PI / 2;
    if (eArrow.force > 0) {
        arrowLength = magLength * eArrow.force;
        drawArrow(eArrow, eArrow.radAngle, magLength * eArrow.force, 0x000000);
    }
    sArrow.radAngle = rads + Math.PI;
    if (sArrow.force > 0) {
        arrowLength = magLength * sArrow.force;
        drawArrow(sArrow, sArrow.radAngle, magLength * sArrow.force, 0x000000);
    }
    wArrow.radAngle = rads + 3 * Math.PI / 2;
    if (wArrow.force > 0) {
        arrowLength = magLength * wArrow.force;
        drawArrow(wArrow, wArrow.radAngle, magLength * wArrow.force, 0x000000);
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
       game.debug.text("nArrow Abs: " + nArrowAbs.fType + " // nArrow Rel: " + nArrow.fType, 10, 330);
       game.debug.text("eArrow Abs: " + eArrowAbs.fType + " // eArrow Rel: " + eArrow.fType, 10, 350);
       game.debug.text("sArrow Abs: " + sArrowAbs.fType + " // sArrow Rel: " + sArrow.fType, 10, 370);
       game.debug.text("wArrow Abs: " + wArrowAbs.fType + " // wArrow Rel: " + wArrow.fType, 10, 390);
       
       game.debug.text("Move Arrow: " + moveArrow.fType, 10, 20);
      
       // game.debug.text("Selected Arrow: " + selectedArrow.fType, 10, 350);
       // game.debug.text("Current Arrow: " + currentArrow.fType, 10, 330);
       // game.debug.text("Handle: " + "(" + handle.x + "," + handle.y + ")", 10, 330);
       //game.debug.text("World: " + "(" + game.world.centerX + "," + game.world.centerY + ")", 10, 350);
      
      
      game.debug.text("move arrow: " + moveArrow.fType + " " + moveArrow.forces.frame, 10, 340);
      game.debug.text("selected arrow: " + selectedArrow.fType + " " + selectedArrow.forces.frame + " " + selectedArrow.forces.visible, 10, 355);
      game.debug.text("hyp2: " + hyp2, 10, 370);
      
       var adjAngle;
       var currentDir;
       if (currentArrow == null) {
           currentDir = "none";
           currentID = -1;
       } else {
           currentDir = currentArrow.dir;
           currentID = currentArrow.ID;
       }
       game.debug.geom(testLine);
       // game.debug.lineInfo(testLine, 10, 32);
       if (testLine.angle < 0) { adjAngle = 2 * Math.PI - Math.abs(testLine.angle) }
       else { adjAngle = testLine.angle };
       //  game.debug.text("adjusted angle: " + adjAngle, 10, 90);
       game.debug.text("current arrow: " + currentDir + " " + currentID, 10, 340);
       game.debug.text("distance from center2: " + hyp2, 10, 355);
       game.debug.text("angle: " + findAngle(), 10, 370);
       game.debug.text("snap to: " + closestAngle(findAngle()), 10, 385);
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

    if (hyp2 < 20) {
        return true;
    }

    if (getArrowByAngle(closestAngle(findAngle())) != null) {

        if ((getArrowByAngle(closestAngle(findAngle())).force == 1 && hyp2 > 50 && hyp2 < 80)
            || (getArrowByAngle(closestAngle(findAngle())).force == 2 && hyp2 > 99)) {
            return true;
        }
    }
    return false;
}
