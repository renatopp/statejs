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
 * - **Lightweight**, only 5KB!
 * 
 * Visit http://statejs.guineashots.com to know more!
 * 
 * @module StateJS
 * @main StateJS
 */
(function() {
  "use strict";

  /**
   * List of internal and helper functions in StateJS.
   * 
   * @class Utils
  **/

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
   * @param {Object} baseClass The super class.
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
