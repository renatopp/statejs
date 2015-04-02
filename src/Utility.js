/**
 * Utility
 *
 * Copyright (c) 2015 Renato de Pontes Pereira.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
**/

/**
 * @module StateJS
 **/

// namespace:
this.statejs = this.statejs || {};

(function() {
  "use strict";

  /**
   * This machine uses utility functions to select the current state.
   * 
   * States must implement `potential` method, returning a numeric value. The
   * `potential` is the utility function of that state. The state that returns
   * the biggest utility will be selected as the current one. The `tick` 
   * method is only called in the current state.
   *
   * @class Utility
   */
  var Utility = statejs.Class();
  var p = Utility.prototype;

  /**
   * Machine unique ID.
   *
   * @property id
   * @type {String}
   * @readonly
  **/
  this.id = null;

  /**
   * Initialization method.
   *
   * @method initialize
   * @constructor
   */
  p.initialize = function() {
    this.id = statejs.createUUID();
    this._states = [];
  }

  /**
   * Adds a new state to the Utility. The state is identified by a name,
   * which must be unique.
   * 
   * @method add
   * @param {String} name The unique name that identifies the state.
   * @param {State} state The state object.
   */
  p.add = function(name, state) {
    for (var i=0; i<this._states.length; i++) {
      if (this._states[i].name === name) {
        throw new Error('State "'+name+'" already on the FSM.');
      }
    }

    this._states.push({name:name, state:state});
    state.target = this.target;
    state.machine = this;

    return this;
  }

  /**
   * Returns a registered state instance by name.
   * 
   * @method get
   * @param  {String} name The state name.
   * @return {State} The state.
   */
  p.get = function(name) {
    for (var i=0; i<this._states.length; i++) {
      if (this._states[i].name === name) {
        return this._states[i].state;
      }
    }
  }

  /**
   * Returns a list of all state names registered in this machine.
   * 
   * @method list
   * @return {Array} An array of state names.
   */
  p.list = function() {
    var result = [];
    for (var i=0; i<this._states.length; i++) {
      result.push(this._states[i].name);
    }

    return result;
  }

  /**
   * Return the name of the current state. Requires a blackboard instance.
   *
   * @method name
   * @param {statejs.Blackboard} memory A Blackboard instance.
   * @return {String} the name of the current state or `null` if none.
   */
  p.name = function(memory) {
    return memory.get('name', this.id);
  }
  
  /**
   * Verifies which state will assume the current execution and propagates the
   * update to current state.
   * 
   * @method tick
   * @param {Object} target A target object.
   * @param {statejs.Blackboard} memory A Blackboard instance.
   */
  p.tick = function(target, memory) {
    var breaked = false;
    var state = null;
    var max = -Infinity;
    var maxState = null;

    for (var i=0; i<this._states.length; i++) {
      state = this._states[i];
      var val = state.state.potential(target, memory);
      if (val > max) {
        max = val;
        maxState = state;
      }
    }

    if (maxState) {
      this._to(maxState.name, target, memory);
      maxState.state.tick(target, memory);
    }
  }

  /**
   * Change the machine to the new state.
   *
   * @method _to
   * @param {String} name The unique name that identifies the state.
   * @param {State} state The state object.
   * @param {String} name The state name.
   * @private
   */
  p._to = function(name, target, memory) {
    if (name === null) {
      memory.set('name', null, this.id);
      return;
    } else if (name === this.name) {
      return;
    }

    var state = this.get(name);
    if (typeof state === 'undefined') {
      throw new Error('State "'+name+'" does not exist.');
    }

    // exit current state
    var fromStateName = memory.get('name', this.id);
    var fromState = this.get(fromStateName);
    if (fromState) {
      fromState.exit(target, memory);
    }

    // change to the next state
    memory.set('name', name, this.id);
    state.enter(target, memory);

    return this;
  }

  statejs.Utility = Utility;
})();