(function() {
  "use strict";
  function MainScene() {
    this.Container_constructor();

    this.agents = [];
    for (var i=0; i<10; i++) {
      var agent = new Agent(this);
      this.agents.push(agent);
      this.addChild(agent);
    }

    game.stage.addChild(this);
    createjs.Ticker.on('tick', this.update, this);
  }
  var p = createjs.extend(MainScene, createjs.Container);

  p.updateMovement = function(e) {
    var fdelta = e.delta/1000.;

    for (var i=0; i<this.agents.length; i++) {
      var agent = this.agents[i];
      var norm = Math.sqrt(Math.pow(agent.dx, 2) + Math.pow(agent.dy, 2));

      if (norm > 5) {
        var x = agent.x;
        var y = agent.y;
        agent.x += settings.SHEEP_MOVE_SPEED*agent.dx*fdelta;
        agent.y += settings.SHEEP_MOVE_SPEED*agent.dy*fdelta;
      }
    }
  }

  p.update = function(e) {
    game.fdelta = e.delta/1000.;

    for (var i=0; i<this.agents.length; i++) {
      var agent = this.agents[i];
      agent.update();
    }

    this.updateMovement(e);

    game.stage.update();
  }

  window.MainScene = createjs.promote(MainScene, "Container");
})();