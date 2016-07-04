var simpleLevelPlan = [
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
  "x                            x",
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

/* TODO
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
  this.size = new Vector(1,1.5);
  this.pos = position.plus(new Vector(0 , -0.5));
  this.speed = new Vector(0,0);
}

Player.prototype.type = "player";

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
Asteroid.prototype.type = "asteroid";

// Constructor for Bullets
function Bullet(position){
  this.size = new Vector(0.4,0.4);
  this.pos = position.plus(0.3,0.3);
  this.speed = new Vector(0,-6);
}

Bullet.prototype.type = "bullet";

// Create the drawing mechanism
function elt(type,className){
  var element = document.createElement(type);
  if(className)
    element.className = className;
  return element;
}

function DOMDisplay(parent , level){
  this.wrap = parent.appendChild(elt("div" , "game"));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  console.log(this.wrap);
  this.actorLayer = null;
  this.drawFrame();
}

var scale = 20;

DOMDisplay.prototype.drawBackground = function(){
  var table = elt("table" , "background");
  table.style.width = this.level.width * scale + "px";

  for(var i=0 ; i<this.level.height ; i++){
    var row = table.appendChild(elt("tr"));
    row.style.height = scale + "px";
    for (var j = 0; j < this.level.width; j++) {
      var data = row.appendChild(elt("td", this.level.grid[i][j]));
    }
  }
  return table;
};

DOMDisplay.prototype.drawActors = function(){
  var wrap = elt("div");
  this.level.actors.forEach(function(actor){
    var rect = wrap.appendChild(elt("div" ,"actor " +  actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function(){
  if(this.actorLayer)
    this.wrap.removeChild(actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || "");
};

DOMDisplay.prototype.clear = function(){
  this.wrap.parentNode.removeChild(this.wrap);
};

var simpleLevel = new Level(simpleLevelPlan);
var display = new DOMDisplay(document.body, simpleLevel);
