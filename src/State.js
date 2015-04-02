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
   * The State class represents generic states that works for all machines. 
   * Some machines require the implementation of specific methods in this 
   * class. Please consult the documentation of the machine you want to use and
   * the description of each method here.
   *
   * To extend the State class you can use the `statejs.Class` function:
   *
   *     var MyState = statejs.Class(statejs.State);
   *
   *     MyState.prototype.tick = function(target, memory) {
   *       console.log('My Implementation')
   *     }
   *  
   * @class State
  **/
  var State = statejs.Class();
  var p = State.prototype;

  /**
   * State unique ID.
   *
   * @property id
   * @type {String}
   * @readonly
  **/
  this.id = null;

  /**
   * The reference to the machine in which this state was added.
   *
   * @property machine
   * @type {Object}
   * @readonly
  **/
  this.machine = null;

  /**
   * Initialization method.
   *
   * @method initialize
   * @constructor
   */
  p.initialize = function() {
    this.id = statejs.createUUID();
    this.machine = null;
  }

  /**
   * Enter method, override this to use. It is called when the machine assume 
   * this state as the current one
   * 
   * @method enter
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.enter = function(target, memory) {}

  /**
   * The potential method is used to some machines for different things. 
   * Consult the machine documentation to know how to implement this.
   *
   * In general, this method is used by machines to verify if the state is able
   * to execute at a given moment or not.
   * 
   * @method potential
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.potential = function(target, memory) {
    if (console && console.log) {
      console.log('Warning: potential not implemented.');
    }
  }

  /**
   * Tick method is called every time a machine is asked to update. Depending 
   * on the machine, the State tick may only be called if it is the current 
   * executing state. Consult the machine documentation to known more.
   * 
   * @method tick
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.tick = function(target, memory) {}

  /**
   * Exit method is called when the state is replaced by another on the 
   * machine.
   * 
   * @method exit
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.exit = function(target, memory) {}
})();