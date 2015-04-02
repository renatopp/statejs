var game = {
  canvas   : null,
  stage    : null,
  scene    : null,
  machine  : null,
  fdelta   : 0
};
var settings = {
  SHEEP_ROTATION_SPEED: 1,
  SHEEP_MOVE_SPEED: 1,
  SHEEP_OBEY_DISTANCE: 100,
  SHEEP_NEIGHBOR_DISTANCE: 100,
  SHEEP_MIN_SAFE_DISTANCE: 40,
  SHEEP_MAX_VELOCITY: 100,
  SHEEP_VELOCITY_DECAY: 0.999,
  SHEEP_FORGET_TIME: 1000,
}


function main() {
  game.canvas   = document.getElementById('game');
  game.stage    = new createjs.Stage(game.canvas);
  game.machine  = new statejs.FSM()
    .add('idle',    new IdleState())
    .add('obey',    new ObeyState())
    .add('stopping', new StoppingState())
  game.scene    = new MainScene();

  createjs.Ticker.framerate = 60;
}
main();