var simpleLevelPlan = [
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x            @               x",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
];

/* TODO -- Create the basic models
-- Write the drawing mechanisms
-- Define the interactions
-- Handle collisions
*/

// Vector constructor
function Vector(x, y){
  this.x = x;
  this.y = y;
}

// Add Utility methods to Vector
Vector.prototype.plus = function(other){
  return new Vector(this.x + other.x , this.y + other.y);
};

Vector.prototype.times = function(factor){
  return new Vector(factor * this.x , factor * this.y);
};

// Level Constructor
function Level(plan){

  // Initialize the height and width of the game
  this.height = plan.length;
  this.width = plan[0].length;

  this.actors = [];
  this.player = null;

  this.grid = [];

  // Parse the plan
  for(var y=0; y<plan.length ; y++){
    var line = plan[y];
    var gridLine = [];
    for(var x=0 ; x < line.length ; x++){
      var ch = plan[y][x], fieldType = null;
      var Actor = actorChars[ch];
      if(Actor){
        this.actors.push(new Actor(new Vector(x,y)));
      }
      else if(ch == "x"){
        fieldType = "wall";
      }
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  // Store the player
  this.player = this.actors.filter(function(actor){
    return actor.type == "player";
  })[0];

  this.status = this.finishDelay = null;

  // Constant parameters for bullet and asteroid delay
  this.bulletDelay = 0.2;
  this.asteroidDelay = 0.3;
}

Level.prototype.isFinished = function(){
  return this.status!=null && this.finishDelay < 0;
};

var actorChars = {
  "@" : Player,
  "^" : Bullet,
  "#" : Asteroid
};

// Constructor for player
function Player(position){
  this.size = new Vector(0.8,1.5);
  this.pos = position.plus(new Vector(0 , -0.5));
  this.speed = new Vector(0,0);
}

// Constructor for Asteroid
function Asteroid(position , type){
  this.type = type;
  if(type == "small"){
    this.size = new Vector(1.5,1.5);
    this.bulletsRequired = 1;
    this.pos = position.plus(new Vector(-0.5,-0.5));
  }else if(type == "large"){
    this.size = new Vector(2.5,2.5);
    this.bulletsRequired = 2;
    this.pos = position.plus(new Vector(-1.5,-1.5));
  }
  this.speed = new Vector(0, 3);
}

// Constructor for Bullets
function Bullet(position){
  this.size = new Vector(0.4,0.4);
  this.pos = position.plus(0.3,0.3);
  this.speed = new Vector(0,-6);
}
