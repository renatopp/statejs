/**
 * State
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
   * A Finite State Machine implementation.
   *
   * The FSM does not use the `potential` method in the state, and it only call
   * the `tick` method of the current state.
   * 
   * @class FSM
   */
  var FSM = statejs.Class();
  var p = FSM.prototype;

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
    this._states = {};
  }

  /**
   * Adds a new state to the FSM. The state is identified by a name, which must
   * be unique.
   * 
   * @method add
   * @param {String} name The unique name that identifies the state.
   * @param {State} state The state object.
   */
  p.add = function(name, state) {
    if (typeof this._states[name] !== 'undefined') {
      throw new Error('State "'+name+'" already on the FSM.');
    }

    this._states[name] = state;
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
    return this._states[name];
  }

  /**
   * Returns a list of all state names registered in this machine.
   * 
   * @method list
   * @return {Array} An array of state names.
   */
  p.list = function() {
    var result = [];
    for (var name in this._states) {
      result.push(name);
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
   * Change the machine to the new state.
   * 
   * @method to
   * @param {String} name The state name.
   * @param {Object} target A target object.
   * @param {statejs.Blackboard} memory A Blackboard instance.
   */
  p.to = function(name, target, memory) {
    if (typeof this._states[name] === 'undefined') {
      throw new Error('State "'+name+'" does not exist.');
    }

    // exit current state
    var fromStateName = memory.get('name', this.id);
    var fromState = this.get(fromStateName);
    if (fromState) {
      fromState.exit(target, memory);
    }

    // change to the next state
    var state = this._states[name];
    memory.set('name', name, this.id);
    state.enter(target, memory);

    return this;
  }

  /**
   * Propagates the update to current state.
   * 
   * @method tick
   * @param {Object} target A target object.
   * @param {statejs.Blackboard} memory A Blackboard instance.
   */
  p.tick = function(target, memory) {
    var stateName = memory.get('name', this.id);
    var state = this.get(stateName);
    if (state) {
      state.tick(target, memory);
    }
  }

  statejs.FSM = FSM;
})();