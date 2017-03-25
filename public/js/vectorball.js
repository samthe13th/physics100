var game = new Phaser.Game(650, 450, Phaser.CANVAS, 'vb-stage', { preload: preload, create: create, update: update, render: render }, true);
var levels = [
    {
        map: [
            ["F", "F", "F", "F", "F", "X", "F", "F", "F", "F", "F"],
            ["F", "F", "F", "F", "X", "X", "X", "F", "F", "F", "F"],
            ["F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F"],
            ["F", "F", "X", "F", "X", "X", "X", "F", "X", "F", "F"],
            ["F", "X", "X", "F", "X", "X", "X", "F", "X", "X", "F"],
            ["F", "F", "X", "F", "X", "X", "X", "F", "X", "F", "F"],
            ["F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F"],
            ["F", "F", "F", "F", "X", "X", "X", "F", "F", "F", "F"],
            ["F", "F", "F", "F", "F", "X", "F", "F", "F", "F", "F"]
        ],
        tiles: ["N", "N", "E", "S"]
    },
    {
        map: [
            ["X", "F", "X", "X", "F", "X", "X", "X", "X", "F", "F"],
            ["F", "F", "X", "X", "F", "F", "X", "X", "X", "F", "F"],
            ["X", "X", "F", "F", "X", "X", "F", "X", "F", "X", "X"],
            ["X", "X", "F", "X", "F", "X", "F", "X", "F", "X", "X"],
            ["X", "F", "X", "F", "F", "F", "X", "X", "X", "F", "X"],
            ["F", "F", "X", "F", "X", "F", "X", "X", "X", "F", "F"],
            ["X", "X", "F", "F", "X", "X", "F", "F", "F", "X", "X"],
            ["X", "X", "F", "F", "X", "X", "X", "F", "X", "X", "X"],
            ["F", "F", "X", "X", "F", "F", "X", "X", "X", "F", "F"]
        ],
        tiles: ["N", "W", "E", "S"]
    }
]
var level = levels[0];
var map = levels[0].map;
var tileWidth = 50;
var levelWin = false;
var ball;
var speed = 200;
var tiles = [
    { x: 550, y: 200, v: "E" },
    { x: 550, y: 250, v: "N" },
    { x: 600, y: 200, v: "N" },
    { x: 600, y: 250, v: "S" }]
var tiles2 = [];
var end;
var dy = -1;
var dx = 0;
var startx = 0;
var starty = 400;
var graphics;
var holes = [];
var nodes = [];
var plus;
function preload() {
    game.load.image('B', 'assets/vectorball/ball.png', 50, 50);
    game.load.image('F', 'assets/vectorball/floor.png', 50, 50);
    game.load.spritesheet('E', 'assets/vectorball/right.png', 50, 50);
    game.load.spritesheet('N', 'assets/vectorball/up.png', 50, 50);
    game.load.spritesheet('S', 'assets/vectorball/down.png', 50, 50);
    game.load.spritesheet('W', 'assets/vectorball/left.png', 50, 50);
    game.load.image('END', 'assets/vectorball/end.png', 50, 50);
    game.load.image('+', 'assets/vectorball/add.jpg', 50, 50);
    game.load.image("slot", 'assets/vectorball/grey.png', 50, 50);
    game.load.image('X', 'assets/vectorball/black.png', 50, 50);
}
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.setBoundsToWorld();
    var row = 0;
    var col = 0;
    var xpos;
    var ypos;
    var sprite = "end";
    for (var row in map) {
        ypos = row * tileWidth;
        for (var i = 0; i < map[row].length; i++) {
            col = i;
            xpos = col * tileWidth;
            var newTile = game.add.sprite(xpos, ypos, map[row][i], 0);
            if (map[row][i] === 'X') {
                holes.push(newTile);
            }
        }
        row++;
    };
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 2; j++) {
            game.add.sprite((j * tileWidth + 550), (i * tileWidth + 200), 'slot', 0);
        }
    };
    for (var i = 0; i < level.tiles.length; i++) {
        var row = 0;
        for (var j = 0; j < 2; j++) {
            tiles2.push(new VTile(500 + (i * tileWidth), 300 + (j * tileWidth), level.tiles[i]));
        }
        row++;
    }
    end = game.add.sprite(500, 0, "END");
    ball = game.add.sprite(startx, starty, "B");
    game.physics.enable([ball], Phaser.Physics.ARCADE);
    game.physics.enable(tiles2, Phaser.Physics.ARCADE)
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballOut, this);
    graphics = game.add.graphics(25, 25);
    graphics.lineStyle(10, 0xffd900, 1);
    window.graphics = graphics;
}
function VTile(x, y, val) {
    var v = game.add.sprite(x, y, val);
    v.inputEnabled = true;
    v.input.enableDrag();
    v.input.enableSnap(tileWidth, tileWidth, true, true);
    v.collidedWith = false;
    v.events.onDragStart.add(function () {
        v.bringToTop();
        ball.bringToTop();
    }, this)
    v.dragFromCenter = true;
    v.dir = val;
    return v;
}
function collisionHandler() {
    console.log("hole collide");
}
function update() {
    graphics.clear();
    graphics.lineStyle(10, 0xffd900, 1);
    if (nodes.length > 0) {
        graphics.moveTo(nodes[0].x, nodes[0].y);
        if (nodes.length > 1) {
            for (var i = 1; i < nodes.length; i++) {
                graphics.lineTo(nodes[i].x, nodes[i].y);
            }
        }
        graphics.lineTo(ball.x, ball.y);
    }
    if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0 && (ball.x !== startx || ball.y !== starty)) {
        resetBall();
    }
    // console.log(tiles2[0].x);
    for (var i = 0; i < tiles2.length; i++) {
        adjustPos(tiles2[i]);
        if (!tiles2[i].collidedWith && game.physics.arcade.distanceBetween(ball, tiles2[i]) < 5) {
            if (tiles2[i].dir === "E") {
                ball.body.velocity.x += speed;
            } else if (tiles2[i].dir === "W") {
                ball.body.velocity.x -= speed;
            } else if (tiles2[i].dir === "N") {
                ball.body.velocity.y -= speed;
            } else {
                ball.body.velocity.y += speed;
            }
            tiles2[i].collidedWith = true;
            tiles2[i].frame = 1;
            nodes.push({ x: tiles2[i].x, y: tiles2[i].y });
        }
    }
    if (!levelWin && game.physics.arcade.distanceBetween(ball, end) < 5) {
        ball.body.velocity.x = 0;
        ball.body.velocity.y = 0;
        alert("LEVEL COMPLETE!");
        levelWin = true;
    }
    for (var i = 0; i < holes.length; i++) {
        if (game.physics.arcade.distanceBetween(ball, holes[i]) < 10) {
            console.log("Going down the hole......... ");
            resetBall();
        }
    }
}
function adjustPos(tile) {
    if (tile.y <= 0) {
        tile.y = 0;
    }
    if (tile.y >= (game.height - tileWidth)) {
        tile.y = game.height - tileWidth;
    }
    if (tile.x <= 0) {
        tile.x = 0;
    }
    if (tile.x >= (game.width - tileWidth)) {
        tile.x = game.width - tileWidth;
    }
}
function collisionCallback(ball, tile) {
    // console.log("callback");
    dx = 1;
}
function processCallback(ball, tile) {
    //  console.log("process callback");
    return true;
}
function ballOut() {
    resetBall();
    //   console.log("ball out");
}
function resetBall() {
    nodes = [];
    ball.x = startx;
    ball.y = starty;
    ball.body.velocity.y = 0;
    ball.body.velocity.x = 0;
    for (var i = 0; i < tiles2.length; i++) {
        tiles2[i].collidedWith = false;
        tiles2[i].frame = 0;
    }
}
function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);
}
function render() {
    // var ballB = ball.getBounds();
    // var plusB = plus.getBounds();
    // //  var d = game.physics.arcade.distanceBetween(ball, end);
    // game.debug.text("BoundsBall: " + ballB, 0, 80);
    // game.debug.text("BoundsPlus: " + plusB, 0, 100);
    // game.debug.text("intersecting?: " + plusB, 0, 120);
    // game.debug.text(Phaser.Rectangle.intersects(ballB, plusB), 0, 50);
    // game.debug.text("nodes: " + JSON.stringify(nodes), 10, 10);
    game.debug.text("vel x: " + ball.body.velocity.x + "vel y: " + ball.body.velocity.y, 550, 20)
}