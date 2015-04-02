(function() {
  "use strict";

  function Agent(scene) {
    this.Container_constructor();

    this.scene = scene;
    this.x = Math.random()*700 + 50;
    this.y = Math.random()*500 + 50;
    this.dx = 0;
    this.dy = 0;

    this.display = new createjs.Shape();
    this.display.graphics.beginFill('white');
    this.display.graphics.drawCircle(0, 0, 20);

    this.title = new createjs.Text('state', '18px arial', '#000');
    this.title.textAlign = 'center';
    this.title.y = -40;

    this.addChild(this.display);
    this.addChild(this.title);

    this.memory = new statejs.Blackboard();
    game.machine.to('idle', this, this.memory);
    this.updateTitle();
  }
  var p = createjs.extend(Agent, createjs.Container);

  p.updateSense = function() {
    var neighbors = [];
    for (var i=0; i<this.scene.agents.length; i++) {
      var agent = this.scene.agents[i];
      if (agent !== this && dist(this.x, this.y, agent.x, agent.y) < settings.SHEEP_NEIGHBOR_DISTANCE) {
        neighbors.push(agent);
      }
    }
    this.memory.set('neighbors', neighbors);
  }

  p.updateTitle = function() {
    this.title.text = game.machine.name(this.memory);
  }

  p.update = function(e) {
    this.updateSense();
    game.machine.tick(this, this.memory);
    this.updateTitle();
  }

  window.Agent = createjs.promote(Agent, "Container");
})();