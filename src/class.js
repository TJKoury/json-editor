/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

let initializing = false
let fnTest = /xyz/.test(function () { this.xyz = 'xyz' }) ? /\b_super\b/ : /.*/
// The base Class implementation (does nothing)
const Class = function () { }

function convertArgumentsToArray (args) {
  return Array.prototype.slice.apply(args)
}

// Create a new Class that inherits from this class
const _ext = function (prop) {
  let _super = this.prototype

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  initializing = true
  let prototype = new this()
  initializing = false

  // Copy the properties over onto the new prototype
  for (let name in prop) {
    // Check if we're overwriting an existing function
    prototype[name] = typeof prop[name] === 'function' &&
      typeof _super[name] === 'function' && fnTest.test(prop[name])
      ? (function (name, fn) {
        return function () {
          let tmp = this._super

          // Add a new ._super() method that is the same method
          // but on the super-class
          this._super = _super[name]

          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          let ret = fn.apply(this, [this].concat(convertArgumentsToArray(arguments)))
          this._super = tmp

          return ret
        }
      })(name, prop[name])
      : (function (fn) {
        return function () {
          let ret = fn.apply(this, [this].concat(convertArgumentsToArray(arguments)))
          return ret
        }
      })(prop[name])
  }

  // The dummy class constructor
  function Class () {
    // All construction is actually done in the init method
    if (!initializing && this.init) { this.init.apply(this, arguments) }
  }

  // Populate our constructed prototype object
  Class.prototype = prototype

  // Enforce the constructor to be what we expect
  Class.prototype.constructor = Class

  // And make this class extendable
  Class.extend = _ext

  return Class
}

Class.extend = _ext

module.exports = Class
