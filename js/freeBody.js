var game = new Phaser.Game(350, 400, Phaser.CANVAS, 'container', { preload: preload, create: create, update: update, render: render }, true);

function preload() {
    game.load.spritesheet('arrowBtns', 'assets/freebody/btnSheet.png', 20, 20);
    game.load.spritesheet('forceBtns', 'assets/freebody/btnsBlank.png', 100, 30, 3);
    game.load.spritesheet('forces', 'assets/freebody/forceSheet.png', 40, 40, 6);
    game.load.spritesheet('rotateBtn', 'assets/freebody/rotateBtn.png', 50, 50, 3);
    game.load.image('handle', 'assets/freebody/handle.png', 30, 30);
    game.load.image('anchor', 'assets/freebody/anchor.png', 15, 15);
}
var group;
var nArrow;
var sArrow;
var wArrow;
var eArrow;
var nArrowAbs;
var sArrowAbs;
var wArrowAbs;
var eArrowAbs;
var box_width = 80;
var arrowLength = 85;
var ahSide = 24;
var btnMargin = 20;
var btnWidth = 20;
var currentArrow;
var rotBtn;
var rotBtn2;
var rotBtn3;
var rotBtn4;
var axis2;
var gBtn;
var nBtn;
var appBtn;
var airBtn;
var frBtn;
var handle;
var graphicsGroup;
var hyp1;
var hyp2;
var testArrow;
var arrowArray;
var arrowID = 0;
var angleText;
var selectedArrow;

function ansArray() {
    var ans = [nArrow, sArrow, wArrow, eArrow, nArrowAbs, sArrowAbs, wArrowAbs, eArrowAbs];
    return ans;
}


function rotateAction() {
    console.log("rotate");
    var input = prompt("Degrees to rotate: ", "");
    var rads = input * Math.PI / 180;
    rotate(rads);
}

var testLine;

function create() {

    graphics1 = game.add.graphics(0, 0);
    anchor = game.add.button(0, 0, 'anchor', createArrow, this, 0, 0, 0);
    anchor.anchor.set(0.5);
    anchor.x = game.world.centerX;
    anchor.y = game.world.centerY;
    handle = game.add.sprite(0, 0, 'handle', 0);
    handle.anchor.set(0.5);
    handle.inputEnabled = true;
    handle.events.onInputDown.add(handleDown, this);
    handle.events.onInputUp.add(handleUp, this);

    testLine = new Phaser.Line(anchor.x, anchor.y, handle.x, handle.y);

    rotBtn = game.add.button(game.world.centerX - 1, -5, 'rotateBtn', rotateAction, this, 1, 0, 2);
    rotBtn.angle = 0;
    rotBtn.forceOut = true;

    var axis = game.add.graphics(0, 0);
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
    nArrow.dir = "N rel";
    sArrow.dir = "S rel";
    wArrow.dir = "W rel";
    eArrow.dir = "E rel";
    nArrowAbs.dir = "N abs";
    sArrowAbs.dir = "S abs";
    wArrowAbs.dir = "W abs";
    eArrowAbs.dir = "E abs";
    nArrow.radAngle = 0;
    sArrow.radAngle = Math.PI;
    wArrow.radAngle = 3 * Math.PI / 2;
    eArrow.radAngle = Math.PI / 2;
    nArrowAbs.radAngle = 0;
    sArrowAbs.radAngle = Math.PI;
    wArrowAbs.radAngle = 3 * Math.PI / 2;
    eArrowAbs.radAngle = Math.PI / 2;

    console.log("sAngle: " + sArrow.angle);
    var fDist = 130;
/*
    nArrow.forces = game.add.button(anchor.x, anchor.y - fDist, 'forces', showForceMenu, this, 1, 1, 1);
    sArrow.forces = game.add.button(anchor.x, anchor.y + fDist, 'forces', showForceMenu, this, 1, 1, 1);
    wArrow.forces = game.add.button(anchor.x - fDist, anchor.y, 'forces', showForceMenu, this, 1, 1, 1);
    eArrow.forces = game.add.button(anchor.x + fDist, anchor.y, 'forces', showForceMenu, this, 1, 1, 1);
       nArrow.forces.pivot.set(nArrow.forces.width / 2, nArrow.forces.height / 2);
    sArrow.forces.pivot.set(sArrow.forces.width / 2, sArrow.forces.height / 2);
    wArrow.forces.pivot.set(wArrow.forces.width / 2, wArrow.forces.height / 2);
    eArrow.forces.pivot.set(eArrow.forces.width / 2, eArrow.forces.height / 2);
*/
    nArrowAbs.forces = game.add.button(anchor.x, anchor.y - fDist, 'forces', showForceMenu, this, 0, 0, 0);
    nArrowAbs.forces.pivot.set(nArrowAbs.forces.width/2, nArrowAbs.forces.height/2);
    sArrowAbs.forces = game.add.button(anchor.x, anchor.y + fDist, 'forces', showForceMenu, this, 0, 0, 0);
    sArrowAbs.forces.pivot.set(sArrowAbs.forces.width/2, sArrowAbs.forces.height/2);
    wArrowAbs.forces = game.add.button(anchor.x - fDist, anchor.y, 'forces', showForceMenu, this, 0, 0, 0);
    wArrowAbs.forces.pivot.set(wArrowAbs.forces.width/2, wArrowAbs.forces.height/2);
    eArrowAbs.forces = game.add.button(anchor.x + fDist, anchor.y, 'forces', showForceMenu, this, 0, 0, 0);
    eArrowAbs.forces.pivot.set(eArrowAbs.forces.width/2, eArrowAbs.forces.height/2);
    

    graphicsGroup = game.add.group();
    graphicsGroup.add(graphics);
    /*
    graphicsGroup.add(nArrow);
    graphicsGroup.add(sArrow);
    graphicsGroup.add(wArrow);
    graphicsGroup.add(eArrow);
    
    graphicsGroup.add(nArrow.forces);
    graphicsGroup.add(sArrow.forces);
    graphicsGroup.add(wArrow.forces);
    graphicsGroup.add(eArrow.forces);
    */
    /*
    graphicsGroup.add(nArrow.plusBtn);
    graphicsGroup.add(sArrow.plusBtn);
    graphicsGroup.add(wArrow.plusBtn);
    graphicsGroup.add(eArrow.plusBtn);
    */
    graphicsGroup.pivot.x = game.world.centerX;
    graphicsGroup.pivot.y = game.world.centerY;

    graphicsGroup.x = game.world.centerX;
    graphicsGroup.y = game.world.centerY;
    setUpInteractives();

    var buttonBlock = game.add.graphics(0, 0);
    buttonBlock.beginFill(0xeae6de);
    buttonBlock.drawRect(game.input.mousePointer.x + 5, game.input.mousePointer.y - 65, 110, 160);

    gBtn = game.add.button(game.input.mousePointer.x + 10, game.input.mousePointer.y - 60, 'forceBtns', function() { forceSelect(gBtn) }, this, 1, 0, 0);
    appBtn = game.add.button(game.input.mousePointer.x + 10, game.input.mousePointer.y - 30, 'forceBtns', function() { forceSelect(appBtn) }, this, 1, 0, 0);
    nBtn = game.add.button(game.input.mousePointer.x + 10, game.input.mousePointer.y, 'forceBtns', function() { forceSelect(nBtn) }, this, 1, 0, 0);
    airBtn = game.add.button(game.input.mousePointer.x + 10, game.input.mousePointer.y + 30, 'forceBtns', function() { forceSelect(airBtn) }, this, 1, 0, 0);
    frBtn = game.add.button(game.input.mousePointer.x + 10, game.input.mousePointer.y + 60, 'forceBtns', function() { forceSelect(frBtn) }, this, 1, 0, 0);

    gBtn.forceOut = true;
    appBtn.forceOut = true;
    nBtn.forceOut = true
    airBtn.forceOut = true;
    frBtn.forceOut = true;

    gBtn.id = "g";
    nBtn.id = "n";
    appBtn.id = "app";
    airBtn.id = "air";
    frBtn.id = "fr";


    gBtn.text = game.add.text(gBtn.x + 20, gBtn.y + 6, "Gravity", { font: "18px Arial", weight: "bold", fill: "0x000000", align: "center" });
    gBtn.text.visible = false;
    appBtn.text = game.add.text(appBtn.x + 20, appBtn.y + 6, "Applied", { font: "18px Arial", weight: "bold", fill: "0x000000", align: "center" });
    appBtn.text.visible = false;
    nBtn.text = game.add.text(nBtn.x + 20, nBtn.y + 6, "Normal", { font: "18px Arial", weight: "bold", fill: "0x000000", align: "center" });
    nBtn.text.visible = false;
    airBtn.text = game.add.text(airBtn.x + 36, airBtn.y + 6, "Air", { font: "18px Arial", weight: "bold", fill: "0x000000", align: "center" });
    airBtn.text.visible = false;
    frBtn.text = game.add.text(frBtn.x + 20, frBtn.y + 6, "Friction", { font: "18px Arial", weight: "bold", fill: "0x000000", align: "center" });
    frBtn.text.visible = false;

    window.rich = gBtn;
    window.rich = appBtn;
    window.rich = nBtn;
    window.rich = airBtn;
    window.rich = frBtn;

    group = game.add.group();

    group.add(buttonBlock);
    group.add(gBtn);
    group.add(appBtn);
    group.add(nBtn);
    group.add(airBtn);
    group.add(frBtn);
    group.add(gBtn.text);
    group.add(appBtn.text);
    group.add(nBtn.text);
    group.add(airBtn.text);
    group.add(frBtn.text);

    group.visible = false;
    arrowArray = [nArrowAbs, sArrowAbs, wArrowAbs, eArrowAbs, nArrow, sArrow, wArrow, eArrow];
    angleText = game.add.text(0, 0, "", { font: "17px Arial", weight: "bold", fill: "white", align: "center" });
    angleText.pivot.set(angleText.width / 2, angleText.height / 2);
    window.graphics = graphics;
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

function overAxis() {
    console.log("over axis");
}

function handleDown() {
    console.log("handle down");
    // console.log("Over " + getArrowByAngle(closestAngle(findAngle())).dir + "with force "
    //   + getArrowByAngle(closestAngle(findAngle())).force);

    if (handle.x == game.world.centerX && handle.y == game.world.centerY) {
        createArrow();
    } else if (getArrowByAngle(closestAngle(findAngle())) != null) {
        if (getArrowByAngle(closestAngle(findAngle())).force != 0) {
            console.log("HANDLE DOWN: currentArrow.dir = " + currentArrow.dir + ", force = " + currentArrow.force);
            getArrowByAngle(closestAngle(findAngle())).force = 0;
            getArrowByAngle(closestAngle(findAngle())).visible = false;
            getArrowByAngle(closestAngle(findAngle())).forces.setFrames(0,0,0);
            
            currentArrow = game.add.graphics(0, 0);
            currentArrow.ID = arrowID;
            arrowID++;
            currentArrow.visible = true;
            
            drawArrow(currentArrow, closestAngle(findAngle()), arrowLength, 0xffffff);
        } else { console.log("no arrow here") }
    }
}

function handleUp() {
    var cAngle = closestAngle(findAngle());
    if (currentArrow != null) {
        if (handle.x == game.world.centerX && handle.y == game.world.centerY) {
            currentArrow.force = 0;
            drawArrow(currentArrow, 0, 0);
        } else {
            console.log("current arrow ID " + currentArrow.ID);
            if (cAngle == nArrowAbs.radAngle || cAngle == 2 * Math.PI) {
                nArrowAbs.force = 1;
                nArrowAbs.visible = true;
                drawArrow(nArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == sArrowAbs.radAngle) {
                sArrowAbs.force = 1;
                sArrowAbs.visible = true;
                drawArrow(sArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == wArrowAbs.radAngle) {
                wArrowAbs.force = 1;
                wArrowAbs.visible = true;
                drawArrow(wArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == eArrowAbs.radAngle) {
                eArrowAbs.force = 1;
                eArrowAbs.visible = true;
                drawArrow(eArrowAbs, cAngle, arrowLength, 0x000000);
            } else if (cAngle == nArrow.radAngle) {
                nArrow.force = 1;
                nArrow.visible = true;
                drawArrow(nArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == eArrow.radAngle) {
                console.log("set Arrow East");
                eArrow.force = 1;
                eArrow.visible = true;
                drawArrow(eArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == sArrow.radAngle) {
                sArrow.force = 1;
                sArrow.visible = true;
                drawArrow(sArrow, cAngle, arrowLength, 0x000000);
            } else if (cAngle == wArrow.radAngle) {
                wArrow.force = 1;
                wArrow.visible = true;
                drawArrow(wArrow, cAngle, arrowLength, 0x000000);
            }
            selectedArrow = getArrowByAngle(closestAngle(findAngle()));
            showForceMenu();
        }
        currentArrow.destroy();
    }
    console.log("current arrow = " + currentArrow);
}

function getArrowByAngle(a) {

    console.log("a = " + a);
    var a2 = a;
    if (a2 == 2 * Math.PI) {
        a2 = 0;
    }
    for (var i = 0; i < arrowArray.length; i++) {
        if (a2 == arrowArray[i].radAngle) {
            console.log("ARROW " + arrowArray[i].dir + " with angle = " + arrowArray[i].radAngle);
            console.log("ID = " + arrowArray[i].ID);
            console.log(true);
            return arrowArray[i];
        }
    }
    return null;
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

function newPlusBtn(btn, dir, arrow) {
    var xpos;
    var ypos;
    var offSet = btnWidth / 2;
    var d;

    console.log(dir);
    console.log(d);

    if (dir === "N") {
        xpos = game.width / 2 - offSet;
        ypos = game.height / 2 - box_width / 2 - btnMargin - offSet;
        d = "N";
    }
    else if (dir === "S") {
        xpos = game.width / 2 - offSet;
        ypos = game.height / 2 + box_width / 2 + btnMargin - offSet;
        d = "S";
    }
    else if (dir === "W") {
        xpos = game.width / 2 - box_width / 2 - btnMargin - offSet;
        ypos = game.height / 2 - offSet;
        d = "W";
    }
    else {
        xpos = game.width / 2 + box_width / 2 + btnMargin - offSet;
        ypos = game.height / 2 - offSet;
        d = "E";
    }
    return game.add.button(xpos, ypos, 'arrowBtns', function() { plusBtnAction(arrow) }, this, 1, 0, 0, 0);
}

function drawArrow(arrow, rot, hyp, color) {
    var aLength = arrowLength;
    arrow.clear();


    if (hyp < 50 && ((game.world.centerY - game.input.mousePointer.y) < 50)) {
        aLength = 0;
    } else {
        //arrow.visible = false;
        /*
                if (hyp > 120) {
                    aLength = 130;
                }
        */
        arrow.lineStyle(6, color);
        /*
                if (hyp > 120) {
                    arrow.lineStyle(10, color);
                }
        */
        arrow.moveTo(game.width / 2, game.height / 2);
        arrow.lineTo(game.width / 2, game.height / 2 - aLength);
        arrow.lineStyle(1, color);
        /*
                if (hyp > 120) {
                    arrow.lineStyle(8, color);
                }
        */
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

function plusBtnAction(arrow) {
    currentArrow = arrow;
    var stretch = 1.5;
    var modal = document.getElementById('pickForce');
    var span = document.getElementsByClassName("close")[0];
    if (arrow.visible == false) {
        arrow.visible = true;
        arrow.force = 1;
        arrow.plusBtn.setFrames(4, 3, 5);
        if (arrow.dir == "N") {
            arrow.plusBtn.y -= arrowLength;
        }
        else if (arrow.dir == "S") {
            arrow.plusBtn.y += arrowLength;
        }
        else if (arrow.dir == "W") {
            arrow.plusBtn.x -= arrowLength;
        } else {
            arrow.plusBtn.x += arrowLength;
        }
        arrow.plusBtn.frame = 3;
        showForceMenu();

    } else {
        arrow.forces.visible = false;
        arrow.visible = false;
        arrow.force = 0;
        arrow.fType = "";
        arrow.plusBtn.setFrames(1, 0, 2);
        if (arrow.dir == "N") {
            arrow.plusBtn.y += arrowLength;
        } else if (arrow.dir == "S") {
            arrow.plusBtn.y -= arrowLength;
        } else if (arrow.dir == "W") {
            arrow.plusBtn.x += arrowLength;
        } else {
            arrow.plusBtn.x -= arrowLength;
        }
        arrow.plusBtn.frame = 0;
    }
}

var page = 1;

$(document).ready(function() {
    var json;
    $.getJSON("json/freebody.json", function(data) {
        json = data;
        setUpExercise(json);
    });
    $("#next").click(function(event) {
        if (page < 3) {
            page++;
        } else {
            page = 1;
        }
        setUpExercise(json);
        //setUpInteractives();
    })
    $("#submit").click(function(event) {

        var correct = true;
        var a = ansArray();
        var title = json.exercises[page - 1].title;
        var ans = json.exercises[page - 1].ans;
        for (var i = 0; i < arrowArray.length; i++) {
            console.log("Arrow " + arrowArray[i].dir + " ANGLE " + arrowArray[i].radAngle + " MAG: " + arrowArray[i].force);
        };
        for (var i = 0; i < 4; i++) {
            if ((a[i].force != ans[i].mag) || (a[i].fType != ans[i].type)) {
                console.log(a[i].force + " " + a[i].fType);
                correct = false;
            };
        };
        alert(correct);
    });
});

function setUpExercise(json) {
    $('#inst').text(json.exercises[page - 1].title);
    $('#stage').load(json.exercises[page - 1].inst);
}

function setUpInteractives() {
    /*
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
  */   
    nArrowAbs.forces.frame = 0;
    sArrowAbs.forces.frame = 0;
    wArrowAbs.forces.frame = 0;
    eArrowAbs.forces.frame = 0;

    /* 
     nArrow.visible = false;
     sArrow.visible = false;
     wArrow.visible = false;
     eArrow.visible = false;
 */
    var aa = ansArray();
    console.log(aa[0].fType);
}

function showForceMenu() {
    group.visible = true;
    group.x = game.input.mousePointer.x - 5;
    group.y = game.input.mousePointer.y - 5;
    gBtn.text.visible = true;
    appBtn.text.visible = true;
    nBtn.text.visible = true;
    airBtn.text.visible = true;
    frBtn.text.visible = true;
}

function over() {
    console.log('button over');
}

function out() {
    console.log('button out');
}

function forceSelect(btn) {
    console.log(btn.id);
    group.visible = false;
    selectedArrow.forces.visible = true;
    if (btn.id === "g") {
        selectedArrow.forces.setFrames(1, 1, 1);
        selectedArrow.fType = "g";
    }
    else if (btn.id === "n") {
        selectedArrow.forces.setFrames(2, 2, 2);
        selectedArrow.fType = "n";
    }
    else if (btn.id === "app") {
        selectedArrow.forces.setFrames(3, 3, 3);
        selectedArrow.fType = "app";
    }
    else if (btn.id === "air") {
        selectedArrow.forces.setFrames(4, 4, 4);
        selectedArrow.fType = "air";
    } else {
        selectedArrow.forces.setFrames(5, 5, 5);
        selectedArrow.fType = "fr";
    }
}

function update() {
    var aLength = arrowLength + 8;
    //handle.visible = false;

    if (hyp2 < 50 && ((game.world.centerY - game.input.mousePointer.y) < 50)) {
        aLength = 0;
        handle.visible = true;
    };
    testLine.fromSprite(anchor, handle, false);
    var ca = closestAngle(findAngle());
    hyp2 = (game.world.centerY - game.input.mousePointer.y) / (Math.cos(findAngle()));
    handle.x = aLength * Math.sin(ca) + game.world.centerX;
    handle.y = game.world.centerY - aLength * Math.cos(ca);
    if (currentArrow != null) {
        drawArrow(currentArrow, ca, hyp2, 0xffffff);
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
    axis2.rotation = rads;
    graphicsGroup.rotation = rads;
    graphics1.clear();
    graphics1.lineStyle(100, 0xFFFFFF, 0.70);
    graphics1.arc(game.world.centerX, game.world.centerY, 40, game.math.degToRad(-90), rads - Math.PI / 2, false);
    graphics1.z = 1;
    nArrow.radAngle = rads;
    if (nArrow.force > 0) {
        drawArrow(nArrow, nArrow.radAngle, arrowLength, 0x000000);
    }
    eArrow.radAngle = rads + Math.PI / 2;
    if (eArrow.force > 0) {
        drawArrow(eArrow, eArrow.radAngle, arrowLength, 0x000000);
    }
    sArrow.radAngle = rads + Math.PI;
    if (sArrow.force > 0) {
        drawArrow(sArrow, sArrow.radAngle, arrowLength, 0x000000);
    }
    wArrow.radAngle = rads + 3 * Math.PI / 2;
    if (wArrow.force > 0) {
        drawArrow(wArrow, wArrow.radAngle, arrowLength, 0x000000);
    }
    angleArray2 = [rads, rads + Math.PI / 2, rads + Math.PI, rads + 3 * Math.PI / 2];
    console.log(angleArray2);
    angleText.text = Math.round(Math.round(rads*180/Math.PI));
    angleText.x = 1.2 * arrowLength * Math.sin(rads / 2) + game.world.centerX - 10;
    angleText.y = game.world.centerY - 1.2 * arrowLength * Math.cos(rads / 2);
}

function render() {
    /*
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
