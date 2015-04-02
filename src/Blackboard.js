/**
 * Blackboard
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
   * The Blackboard is the memory structure required by machines and its 
   * states. It only have 2 public methods: `set` and `get`. These methods 
   * works in 3 different contexts: global, per machine, and per state per 
   * machine.
   * 
   * Suppose you have two different machines controlling a single object with a
   * single blackboard, then:
   *
   * - In the global context, all states will access the stored information. 
   * - In per machine context, only states sharing the same machine share the 
   *   stored information.
   * - In per state per machine context, the information stored in the 
   *   blackboard can only be accessed by the same state that wrote the data.
   *   
   * The context is selected indirectly by the parameters provided to these 
   * methods, for example:
   * 
   *     // getting/setting variable in global context
   *     blackboard.set('testKey', 'value');
   *     var value = blackboard.get('testKey');
   *     
   *     // getting/setting variable in per machine context
   *     blackboard.set('testKey', 'value', machine.id);
   *     var value = blackboard.get('testKey', machine.id);
   *     
   *     // getting/setting variable in per state per machine context
   *     blackboard.set('testKey', 'value', machine.id, state.id);
   *     var value = blackboard.get('testKey', machine.id, state.id);
   * 
   * Note: Internally, the blackboard store these memories in different 
   * objects, being the global on `_baseMemory`, the per machine on 
   * `_machineMemory` and the per state per machine dynamically create inside 
   * the per machine memory (it is accessed via 
   * `_machineMemory[id].stateMemory`). Avoid to use these variables manually, 
   * use `get` and `set` instead.
   *  
   * @class Blackboard
   */
  var Blackboard = statejs.Class();
  var p = Blackboard.prototype;

  /**
   * Initialization method.
   *
   * @method initialize
   * @constructor
   */
  p.initialize = function() {
    this._baseMemory = {};
    this._machineMemory = {};
  }

  /**
   * Internal method to retrieve the machine context memory. If the memory does
   * not exist, this method creates it.
   *
   * @method _getMachineMemory
   * @param {string} machineScope The id of the machine in scope.
   * @returns {Object} The machine memory.
   * @protected
   */
  p._getMachineMemory = function(machineScope) {
    if (!this._machineMemory[machineScope]) {
      this._machineMemory[machineScope] = {
        'stateMemory' : {},
      };
    }
    return this._machineMemory[machineScope];
  };

  /**
   * Internal method to retrieve the state context memory, given the machine 
   * memory. If the memory does not exist, this method creates is.
   *
   * @method _getStateMemory
   * @param {String} machineMemory the machine memory.
   * @param {String} stateScope The id of the state in scope.
   * @returns {Object} The state memory.
   * @protected
   */
  p._getStateMemory = function(machineMemory, stateScope) {
    var memory = machineMemory['stateMemory'];
    if (!memory[stateScope]) {
      memory[stateScope] = {};
    }

    return memory[stateScope];
  };

  /**
   * Internal method to retrieve the context memory. If machineScope and 
   * stateScope are provided, this method returns the per state per machine 
   * memory. If only the machineScope is provided, it returns the per machine 
   * memory. If no parameter is provided, it returns the global memory. 
   * Notice that, if only stateScope is provided, this method will still 
   * return the global memory.
   *
   * @method _getMemory
   * @param {String} machineScope The id of the machine scope.
   * @param {String} stateScope The id of the state scope.
   * @returns {Object} A memory object.
   * @protected
   */
  p._getMemory = function(machineScope, stateScope) {
    var memory = this._baseMemory;

    if (machineScope) {
      memory = this._getMachineMemory(machineScope);

      if (stateScope) {
        memory = this._getStateMemory(memory, stateScope);
      }
    }

    return memory;
  };

  /**
   * Stores a value in the blackboard. If machineScope and stateScope are 
   * provided, this method will save the value into the per state per machine 
   * memory. If only the machineScope is provided, it will save the value into 
   * the per machine memory. If no parameter is provided, this method will save 
   * the value into the global memory. Notice that, if only stateScope is 
   * provided (but machineScope not), this method will still save the value into
   * the global memory.
   *
   * @method set
   * @param {String} key The key to be stored.
   * @param {String} value The value to be stored.
   * @param {String} machineScope The machine id if accessing the machine or state 
   *                           memory.
   * @param {String} stateScope The state id if accessing the state memory.
  **/
  p.set = function(key, value, machineScope, stateScope) {
    var memory = this._getMemory(machineScope, stateScope);
    memory[key] = value;
  };

  /**
   * Retrieves a value in the blackboard. If machineScope and stateScope are
   * provided, this method will retrieve the value from the per state per machine
   * memory. If only the machineScope is provided, it will retrieve the value
   * from the per machine memory. If no parameter is provided, this method will
   * retrieve from the global memory. If only stateScope is provided (but
   * machineScope not), this method will still try to retrieve from the global
   * memory.
   *
   * @method get
   * @param {String} key The key to be retrieved.
   * @param {String} machineScope The machine id if accessing the machine or state 
   *                           memory.
   * @param {String} stateScope The state id if accessing the state memory.
   * @returns {Object} The value stored or undefined.
  **/
  p.get = function(key, machineScope, stateScope) {
    var memory = this._getMemory(machineScope, stateScope);
    return memory[key];
  };
  
  statejs.Blackboard = Blackboard;

})();