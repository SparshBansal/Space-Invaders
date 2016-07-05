gitvar simpleLevelPlan = [
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
  "x             @              x",
  "x                            x",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
];

/* TODO
-- Put animation framework in place
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
  this.asteroidType = type;
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

Level.prototype.obstacleAt = function(pos , size){
  var minX = Math.floor(pos.x);
  var maxX = Math.ceil(pos.x + size.x);
  var minY = Math.floor(pos.y);
  var maxY = Math.ceil(pos.y + size.y);

  for(var i = minY ; i < maxY; i++){
    for(var j = minX ; j < maxX; j++){
      if(this.grid[i][j])
        return this.grid[i][j];
    }
  }
  return null;
}

Level.prototype.actorAt = function(actor){
  for(var i=0 ; i<this.actors.length ; i++){
    var other = actors[i];
    if(actor! = other){
      if(actor.pos.x + actor.size.x < other.pos.x ||
        actor.pos.x < other.pos.x + other.size.x ||
        actor.pos.y + actor.size.y < other.pos.y ||
        actor.pos.y < other.pos.y + other.size.y){

        }
        else
        return other;
      }
  });
};

var maxStep = 0.05;

var type = {
  0 : "small",
  1 : "large"
};

Level.prototype.createAsteroid = function(){
  var max = this.width - 1;
  var min = 2;
  var asteroidIndex = Math.floor(Math.random() * (max - min + 1)) + min;
  var asteroidType = type[Math.floor(Math.random() * (2)) + 0;]
  var newAsteroid = new Asteroid(new Vector(asteroidIndex , -1) , asteroidType);
  this.actors.push(newAsteroid);
}

Level.prototype.animate = function(step , keys){
  while(step > 0){
    if(this.status != null)
    this.finishDelay -= step;

    // If asteroid delay < 0 , then create a new asteroid
    if(this.asteroidDelay < 0){
      this.createAsteroid();
      this.asteroidDelay = 0.3;
    }else
      this.asteroidDelay -= step;

    var thisStep = Math.min(step , maxStep);
    this.actors.forEach(function(actor){
      actor.act(thisStep ,this , keys);
    } , this);
    step -= thisStep;
  }
};

Asteroid.prototype.act = function(step , level){
  var newPosition = this.pos.plus(this.speed.times(step));

  // If there is an obstacle at this position then we remove the Asteroid
  // Because it must have hit the bottom
  if(level.obstacleAt(newPosition , this.size)){
    level.actors = level.actors.filter(function(actor){
      return this!= actor;
    } , this);
  }else
    this.pos = newPosition;
};

Bullet.prototype.act = function(step , level){
  var newPosition = this.pos.plus(this.speed.times(step));

  if(level.obstacleAt(newPosition , this.size)){
    console.log("Don't know how the f**k this happened");
  }
  this.pos = newPosition;
  var collisionActor = actorAt(this);
  if(collisionActor){
    level.handleBulletCollision(this , collisionActor);
  }
};

Level.prototype.handleBulletCollision = function(bullet , actor){
  if(actor.type == "asteroid"){
    actor.bulletsRequired -= 1;

    // If the asteroid has been hit enough times destroy it
    if(actor.bulletsRequired <= 0){
      this.actors = this.actors.filter(function(other){
        return actor!=other;
      });
    }
  }else{
    console.log("Now how did this happen");
  }

  // Remove the bullet from actors
  this.actors = this.actors.filter(function(other){
    return bullet != other;
  });
};

// Handle players movements
var playerSpeed = 7;

// Handle horizontal movements
Player.prototype.moveX = function(step , level , keys){
  this.speed.x = 0;

  if(keys.left)
    this.speed.x = -playerSpeed;
  if(keys.right)
    this.speed.x = playerSpeed;

  var speedX = new Vector(this.speed.x , 0);
  var motion = speedX.times(step);
  var newPosition = this.pos.plus(motion);

  if(!level.obstacleAt(newPosition , this.size))
    this.position = newPosition;
  else{
    // We have hit the wall , don't do anything
  }
};

// Handle vertical movements
Player.prototype.moveY = function(step , level , keys){
  this.speed.y = 0;

  if(keys.up)
    this.speed.y = -playerSpeed;
  if(keys.down)
    this.speed.y = playerSpeed;

  var speedY = new Vector(0 , this.speed.y);
  var motion = speedY.times(step);
  var newPosition = this.pos.plus(motion);

  if(!level.obstacleAt(newPosition , this.size))
  else{
    // We have hit a wall , don't do anything
  }
};

Level.prototype.createBullet = function(position){
  var newBullet = new Bullet(position);
  this.actors.push(newBullet);
}

// Handle movements , collisions with other actors , bullet firing
Player.prototype.act = function(step , level , keys){
  this.moveX(step , level , keys);
  this.moveY(step , level , keys);

  // Handle the player collisions
  var collisionActor = level.actorAt(this);
  if(collisionActor){
    if(collisionActor.type == "asteroid"){
      this.status = "lost";
      this.finishDelay = 1;
    }else{
      // do nothing
    }
  }

  // If status == lost , game over!!!
  if(level.status == "lost"){
    this.pos.y += step;
    this.size.y -= step;
  }

  // Handle bullet firing
  if(keys.space){
    if(level.bulletDelay <= 0){
      // fire the bullet
      var pos = this.pos.plus(0 , -1);
      level.createBullet(pos);
      this.bulletDelay = 0.2;
    }else{
      this.bulletDelay -= step;
    }
  }
};

// Add keypress event listeners
var arrowCodes = {
  37 : "left",
  38 : "up",
  39 : "right",
  40 : "down",
  32 : "space"
};

var trackKeys = function(codes){
  var pressed = Object.create(null);
  var keypressHandler = function(event){
    if(codes.hasOwnProperty(event.keyCode)){
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown" , keypressHandler);
  addEventListener("keyup" , keypressHandler);
  return pressed;
}

var keys = trackKeys(arrowCodes);
