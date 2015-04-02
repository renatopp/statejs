this.statejs = this.statejs || {};

(function() {
  "use strict";

  /**
   * This function is used to create unique IDs for trees and nodes.
   * 
   * (consult http://www.ietf.org/rfc/rfc4122.txt).
   *
   * @method createUUID
   * @return {String} A unique ID.
  **/
  statejs.createUUID = function() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    // bits 12-15 of the time_hi_and_version field to 0010
    s[14] = "4";

    // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);

    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }

  /**
   * Class is a meta-factory function to create classes in JavaScript. It is a
   * shortcut for the CreateJS syntax style. By default, the class created by 
   * this function have an initialize function (the constructor). Optionally, you
   * can specify the inheritance by passing another class as parameter.
   *
   * By default, all classes created using this function, may receives only a
   * settings parameter as argument. This pattern is commonly used by jQuery and 
   * its plugins.
   *
   * Usage
   * -----
   *
   *     // Creating a simple class
   *     var BaseClass = statejs.Class();
   *
   *     // Using inheritance
   *     var ChildClass = statejs.Class(BaseClass);
   *
   *     // Defining the constructor
   *     ChildClass.prototype.initialize = function(settings) { ... }
   *
   * @method Class
   * @param {Object} [baseClass] The super class.
   * @return {Object} A new class.
  **/
  statejs.Class = function(baseClass) {
    // create a new class
    var cls = function(params) {
      this.initialize(params);
    };
    
    // if base class is provided, inherit
    if (baseClass) {
      cls.prototype = Object.create(baseClass.prototype);
      cls.prototype.constructor = cls;
    }
    
    // create initialize if does not exist on baseClass
    if(!cls.prototype.initialize) {
      cls.prototype.initialize = function() {};
    }

    return cls;
  }

})();
/**
 * Blackboard
 *
 * Copyright (c) 2014 Renato de Pontes Pereira.
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
 * @module Behavior3JS
 **/

// namespace:
this.statejs = this.statejs || {};

(function() {
"use strict";

/**
 * The Blackboard is the memory structure required by `BehaviorTree` and its 
 * nodes. It only have 2 public methods: `set` and `get`. These methods works 
 * in 3 different contexts: global, per machine, and per node per machine.
 * 
 * Suppose you have two different machines controlling a single object with a 
 * single blackboard, then:
 *
 * - In the global context, all nodes will access the stored information. 
 * - In per machine context, only nodes sharing the same machine share the stored 
 *   information.
 * - In per node per machine context, the information stored in the blackboard can
 *   only be accessed by the same node that wrote the data.
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
 *     // getting/setting variable in per node per machine context
 *     blackboard.set('testKey', 'value', machine.id, node.id);
 *     var value = blackboard.get('testKey', machine.id, node.id);
 * 
 * Note: Internally, the blackboard store these memories in different objects,
 *  being the global on `_baseMemory`, the per machine on `_machineMemory` and the 
 *  per node per machine dynamically create inside the per machine memory (it is 
 *  accessed via `_machineMemory[id].nodeMemory`). Avoid to use these variables 
 *  manually, use `get` and `set` instead.
 *  
 * @class Blackboard
**/
var Blackboard = statejs.Class();

var p = Blackboard.prototype;

    /**
     * Initialization method.
     *
     * @method initialize
     * @constructor
    **/
    p.initialize = function() {
        this._baseMemory = {};
        this._machineMemory = {};
    }

    /**
     * Internal method to retrieve the machine context memory. If the memory does
     * not exist, this method creates it.
     *
     * @method _getTreeMemory
     * @param {string} machineScope The id of the machine in scope.
     * @returns {Object} The machine memory.
     * @protected
    **/
    p._getTreeMemory = function(machineScope) {
        if (!this._machineMemory[machineScope]) {
            this._machineMemory[machineScope] = {
                'nodeMemory'         : {},
                'openNodes'          : [],
                'traversalDepth'     : 0,
                'traversalCycle'     : 0,
            };
        }
        return this._machineMemory[machineScope];
    };

    /**
     * Internal method to retrieve the node context memory, given the machine 
     * memory. If the memory does not exist, this method creates is.
     *
     * @method _getNodeMemory
     * @param {String} machineMemory the machine memory.
     * @param {String} nodeScope The id of the node in scope.
     * @returns {Object} The node memory.
     * @protected
    **/
    p._getNodeMemory = function(machineMemory, nodeScope) {
        var memory = machineMemory['nodeMemory'];
        if (!memory[nodeScope]) {
            memory[nodeScope] = {};
        }

        return memory[nodeScope];
    };

    /**
     * Internal method to retrieve the context memory. If machineScope and 
     * nodeScope are provided, this method returns the per node per machine 
     * memory. If only the machineScope is provided, it returns the per machine 
     * memory. If no parameter is provided, it returns the global memory. 
     * Notice that, if only nodeScope is provided, this method will still 
     * return the global memory.
     *
     * @method _getMemory
     * @param {String} machineScope The id of the machine scope.
     * @param {String} nodeScope The id of the node scope.
     * @returns {Object} A memory object.
     * @protected
    **/
    p._getMemory = function(machineScope, nodeScope) {
        var memory = this._baseMemory;

        if (machineScope) {
            memory = this._getTreeMemory(machineScope);

            if (nodeScope) {
                memory = this._getNodeMemory(memory, nodeScope);
            }
        }

        return memory;
    };

    /**
     * Stores a value in the blackboard. If machineScope and nodeScope are 
     * provided, this method will save the value into the per node per machine 
     * memory. If only the machineScope is provided, it will save the value into 
     * the per machine memory. If no parameter is provided, this method will save 
     * the value into the global memory. Notice that, if only nodeScope is 
     * provided (but machineScope not), this method will still save the value into
     * the global memory.
     *
     * @method set
     * @param {String} key The key to be stored.
     * @param {String} value The value to be stored.
     * @param {String} machineScope The machine id if accessing the machine or node 
     *                           memory.
     * @param {String} nodeScope The node id if accessing the node memory.
    **/
    p.set = function(key, value, machineScope, nodeScope) {
        var memory = this._getMemory(machineScope, nodeScope);
        memory[key] = value;
    };

    /**
     * Retrieves a value in the blackboard. If machineScope and nodeScope are
     * provided, this method will retrieve the value from the per node per machine
     * memory. If only the machineScope is provided, it will retrieve the value
     * from the per machine memory. If no parameter is provided, this method will
     * retrieve from the global memory. If only nodeScope is provided (but
     * machineScope not), this method will still try to retrieve from the global
     * memory.
     *
     * @method get
     * @param {String} key The key to be retrieved.
     * @param {String} machineScope The machine id if accessing the machine or node 
     *                           memory.
     * @param {String} nodeScope The node id if accessing the node memory.
     * @returns {Object} The value stored or undefined.
    **/
    p.get = function(key, machineScope, nodeScope) {
        var memory = this._getMemory(machineScope, nodeScope);
        return memory[key];
    };
    
statejs.Blackboard = Blackboard;

})();/**
 * State
 *
 * Copyright (c) 2014 Renato de Pontes Pereira.
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
   * State class.
   *  
   * @class State
  **/
  var State = statejs.Class();
  var p = State.prototype;

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
   * Enter method, override this to use. It is called when the machine pass the
   * execution to the state.
   * 
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.enter = function(target, memory) {}

  /**
   * The potential method is used to some machines for different things. 
   * Consult the machine documentation to know how to implement this.
   * 
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.potential = function(target, memory) {}

  /**
   * Tick method is called every time a machine is asked to update. The State 
   * tick is only executed if it is the current executing state.
   * 
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.tick = function(target, memory) {}

  /**
   * Exit method is called when the state is replaced by another on the 
   * machine.
   * 
   * @param {Object} target A target object, commonly an agent.
   * @param {Object} memory A blackboard object.
   */
  p.exit = function(target, memory) {}
})();this.statejs = this.statejs || {};

(function() {
  "use strict";

  /**
   * A Finite State Machine implementation. 
   * 
   * @class
   */
  var FSM = statejs.Class();
  var p = FSM.prototype;

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
   * Returns a state by name.
   * 
   * @param  {String} name The state name.
   * @return {State} The state.
   */
  p.get = function(name) {
    return this._states[name];
  }

  /**
   * Returns a list of all state names registered in this FSM.
   * 
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
   * Return the name of the current state.
   */
  p.name = function(memory) {
    return memory.get('name', this.id);
  }

  /**
   * Change the machine to the new state.
   * 
   * @param {String} name The state name.
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