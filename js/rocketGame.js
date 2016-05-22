var game = new Phaser.Game(300,500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('rocket', 'assets/rocket.png');
    game.load.image('platform', 'assets/platform.png');
}

var rocket;
var platform;
var fullTank = 0;
var fuel;
var fuelDisplay;
var velocityDisplay;
var velocity;
var launched = false;
var CD;
var count = 3;
var massR = 31.735;
var massI;
var mass;

function create() {
    fuel = fullTank;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0,0,'sky');
    cursors = game.input.keyboard.createCursorKeys();
    
    //Add Platform
    platform = game.add.sprite(0,0,'platform');
    platform.enableBody = true;
    platform.y = game.world.height - platform.height;
    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    
    //addRocket
    addRocket();
}

function addRocket(){
    rocket = game.add.sprite(0,0, 'rocket'); 
    rocket.enableBody = true;
    rocket.x = game.world.width/3;
    rocket.y = game.world.height - rocket.height - platform.height;    
    game.physics.arcade.enable(rocket);
    rocket.body.bounce.y = 0.2;
    rocket.body.gravity.y = 981;   
}

function update() {
     game.physics.arcade.collide(rocket, platform, killRocket, null, this);
     rocket.body.acceleration.y  = 0;

         if (launched === true && fuel > 10)
    {
            rocket.body.acceleration.y = -1150;
            fuel -= 10;
            mass = massR + fuel;
            fuelDisplay.text = 'mass: ' + mass + ' kg '+ ' ' + 'vel: ' + getVelocity() + ' m/s';
    } 
    
    if (fuel < 10 && fuel > 0) {
        fuel = 0;
        mass = massR;
        fuelDisplay.text = 'mass: ' + mass + ' kg '+ ' ' + 'vel: ' + getVelocity() + ' m/s';
    }
}

function countDown(){  
        CD = game.add.text(120, 150, count, { font: "bold 130px Arial", fill: "#fff"});
        game.time.events.repeat(Phaser.Timer.SECOND, 3, launchRocket, this);        
}

function launchRocket(){
    count--;
    CD.text = count;
    if (count < 1){
         launched = true;
         CD.text = '';
    }    
    
}

function killRocket(){
    if (fuel < (fullTank - 30)){
        rocket.kill();
    }
};

//jQuery functions
$(document).ready(function(){
    $("#launchBtn").click(function(){
                var fuelInput = $('#fuel').val();
        if(validated(fuelInput)){
            $("#launchBtn").prop("disabled",false);
            $("#fuel").prop("disabled", true);
            $("#setFuelBtn").prop("disabled", true);
            launched = false;
            fullTank = fuelInput;
            fuel = fullTank;
            massI = massR + fuel;
            mass = massI;
            fuelDisplay = game.add.text(20, 475, 'mass: ' + mass + ' kg ' + ' ' + 'vel: ' + getVelocity() + ' m/s' , {  font: "16px Arial", fill: '#fff' });
            countDown();
            $("#launchBtn").prop("disabled",true);
        }
    });
});

function getVelocity(){
    var v = (2500)*(Math.log(massI/mass));
    return Math.round(v);
}

function validated(f){
    if (isNaN(f) || f == 0 || f == null){
        alert("Not a valid fuel amount!");
        return false;
    };
    return true;
}