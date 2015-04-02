/**
 * statejs
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
 */
this.statejs = this.statejs || {};

/**
 * StateJS
 * =======
 *
 * * * *
 *
 * **StateJS** is a Javascript library that provides state-based models such
 * as Finite State Machines and the Subsumption architecture. It aims speed,
 * low memory consuption and multi-agent control. Check out some features 
 * of StateJS:
 *
 * - StateJS provides **Finite State Machines**, **Subsumption Architecture** 
 *   and **Utility Functions**;
 * - **Extensible and Flexible**, create new Machines or your own version of 
 *   FSM or Utilities;
 * - **Optimized to control multiple agents**, you can use a single machine 
 *   instance to handle hundreds of agents;
 * - **Completely free**, StateJS is published under the MIT License, which 
 *   means that you can use it for your open source and commercial projects;
 * - **Lightweight**, only 11.5KB!
 * 
 * Visit http://statejs.guineashots.com to know more!
 * 
 * @module StateJS
 * @main   StateJS
 */
(function() {
  "use strict";

  /**
   * This function is used to create unique IDs for machines and states.
   * 
   * (consult http://www.ietf.org/rfc/rfc4122.txt).
   *
   * @method createUUID
   * @return {String} A unique ID.
   */
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
   */
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

})();/**
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
})();/**
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
   * @class
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
   * @param  {String} name The state name.
   * @return {State} The state.
   */
  p.get = function(name) {
    return this._states[name];
  }

  /**
   * Returns a list of all state names registered in this machine.
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
   * Return the name of the current state. Requires a blackboard instance.
   *
   * @param {statejs.Blackboard} memory A Blackboard instance.
   * @return {String} the name of the current state or `null` if none.
   */
  p.name = function(memory) {
    return memory.get('name', this.id);
  }

  /**
   * Change the machine to the new state.
   * 
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
})();/**
 * Subsumption
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
   * A simple Subsumption architecture.
   * 
   * Subsumption states must implement the `potential` method, returning `true`
   * or `false`. This machine will verify sequentially, from the first added 
   * state to the last, if each state can execute. If the a state return `true`
   * in the `potential` method, this machine will assume it as the current 
   * state. The `tick` method is only called in the current state.
   *
   * @class
   */
  var Subsumption = statejs.Class();
  var p = Subsumption.prototype;

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
   * Adds a new state to the Subsumption. The state is identified by a name,
   * which must be unique.
   * 
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
   * @param {Object} target A target object.
   * @param {statejs.Blackboard} memory A Blackboard instance.
   */
  p.tick = function(target, memory) {
    var breaked = false;
    var state = null;
    for (var i=0; i<this._states.length; i++) {
      state = this._states[i];
      if (state.state.potential(target, memory)) {
        this._to(state.name, target, memory);
        breaked = true;
        break;
      }
    }

    if (!breaked) {
      this._to(null, target, memory);
    } else if (state) {
      state.state.tick(target, memory);
    }
  }

  /**
   * Change the machine to the new state.
   *
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

  statejs.Subsumption = Subsumption;
})();/**
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
   * @class
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