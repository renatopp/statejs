var dist = function(x1, y1, x2, y2) { 
  return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}
var norm2d = function(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}

function _avoidMouse(target, neighbors) {
  var px = 0;
  var py = 0;
  var mx = game.stage.mouseX;
  var my = game.stage.mouseY;

  if (dist(target.x, target.y, mx, my) < settings.SHEEP_OBEY_DISTANCE) {
    var px = (mx - target.x);
    var py = (my - target.y);
  }

  return [-px, -py];
}
function _centering(target, neighbors) {
  var px = 0;
  var py = 0;

  if (neighbors.length) {
    for (var i=0; i<neighbors.length; i++) {
      px += neighbors[i].x;
      py += neighbors[i].y;
    }
    px = (px/neighbors.length - target.x)/10;
    py = (py/neighbors.length - target.y)/10;
  }

  return [px, py];
}
function _velocity(target, neighbors) {
  var px = 0;
  var py = 0;

  if (neighbors.length) {
    for (var i=0; i<neighbors.length; i++) {
      px += neighbors[i].dx;
      py += neighbors[i].dy;
    }
    px = (px/neighbors.length - target.dx)/10;
    py = (py/neighbors.length - target.dy)/10;
  }

  return [px, py];
}
function _avoidOthers(target, neighbors) {
  var px = 0;
  var py = 0;

  if (neighbors.length) {
    for (var i=0; i<neighbors.length; i++) {
      var n = neighbors[i]
      var d = dist(target.x, target.y, n.x, n.y);

      if (d < settings.SHEEP_MIN_SAFE_DISTANCE) {
          px += target.x - n.x;
          py += target.y - n.y;
      }
    }
  }

  return [px, py];
}
function flock(target, neighbors, mods) {
  var rules = [
    _avoidMouse(target, neighbors),
    _centering(target, neighbors),
    _avoidOthers(target, neighbors),
    _velocity(target, neighbors),
  ];

  var x=0, y=0;
  for (var i=0; i<rules.length; i++) {
    x += rules[i][0]*mods[i];
    y += rules[i][1]*mods[i];
  }
  target.dx = (target.dx+x)*(1-settings.SHEEP_VELOCITY_DECAY*game.fdelta);
  target.dy = (target.dy+y)*(1-settings.SHEEP_VELOCITY_DECAY*game.fdelta);

  var norm = norm2d(target.dx, target.dy);
  if (norm > settings.SHEEP_MAX_VELOCITY) {
      target.dx = (target.dx/norm)*settings.SHEEP_MAX_VELOCITY;
      target.dy = (target.dy/norm)*settings.SHEEP_MAX_VELOCITY;
  }
}

var IdleState = statejs.Class(statejs.State);
IdleState.prototype.enter = function(target, memory) {}
IdleState.prototype.exit = function(target, memory) {}
IdleState.prototype.tick = function(target, memory) {
  var mx = game.stage.mouseX;
  var my = game.stage.mouseY;

  if (dist(target.x, target.y, mx, my) < settings.SHEEP_OBEY_DISTANCE) {
    this.machine.to('obey', target, memory);
  }

  flock(target, memory.get('neighbors'), [0.0, 0.0, 0.3, 0.1])
}

var ObeyState = statejs.Class(statejs.State);
ObeyState.prototype.enter = function(target, memory) {}
ObeyState.prototype.exit = function(target, memory) {
  memory.set('starttime', false, this.machine.id, this.id)
}
ObeyState.prototype.tick = function(target, memory) {
  var mx = game.stage.mouseX;
  var my = game.stage.mouseY;

  if (dist(target.x, target.y, mx, my) > settings.SHEEP_OBEY_DISTANCE) {
    var starttime = memory.get('starttime', this.machine.id, this.id);
    var curtime = new Date().getTime();
    if (!starttime) {
      memory.set('starttime', curtime, this.machine.id, this.id)
      starttime = curtime;
    }
    // console.log(curtime, starttime, curtime-starttime, settings.SHEEP_FORGET_TIME)
    if (curtime-starttime > settings.SHEEP_FORGET_TIME) {
      this.machine.to('stopping', target, memory);
    }
  } else {
    memory.set('starttime', false, this.machine.id, this.id)
  }

  flock(target, memory.get('neighbors'), [1.0, 0.6, 1.0, 1.0])
}

var StoppingState = statejs.Class(statejs.State);
StoppingState.prototype.enter = function(target, memory) {
  memory.set('starttime', new Date().getTime(), this.machine.id, this.id);
}
StoppingState.prototype.exit = function(target, memory) {}
StoppingState.prototype.tick = function(target, memory) {
  var mx = game.stage.mouseX;
  var my = game.stage.mouseY;

  if (dist(target.x, target.y, mx, my) < settings.SHEEP_OBEY_DISTANCE) {
    this.machine.to('obey', target, memory);
  }

  var starttime = memory.get('starttime', this.machine.id, this.id);
  var curtime = new Date().getTime();
  if (curtime - starttime > 3000) {
    this.machine.to('idle', target, memory);
  }

  flock(target, memory.get('neighbors'), [0.0, 0.1, 1.0, 0.4])
}
