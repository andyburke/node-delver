// https://github.com/ttaubert/node-accessors
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// accessors may be freely distributed under the MIT license.

"use strict";

module.exports = Accessors;

var isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var arraymatcher = /^(.*?)\[(\d+)?\]$/;

function Accessors(obj) {
  if (!(this instanceof Accessors)) {
    return new Accessors(obj);
  }

  this.object = obj;
  return this;
}

Accessors.prototype.get = function(key, def) {
    return Accessors.get(this.object, key, def);
}

Accessors.prototype.set = function(key, def) {
    return Accessors.set(this.object, key, def);
}

Accessors.get = function (obj, key, def) {
  if (typeof(obj) !== "object") {
    throw new TypeError("Object to access must be an object.");
  }
  if (typeof(key) !== "string") {
    throw new TypeError("Key to access must be a string.");
  }
  if (/(^\.|\.$|\.\.)/.test(key)) {
    throw new Error("Given key is invalid.");
  }

  var parts = key.split(".");

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    if (/\[/.test(part)) {
      var found = part.match(arraymatcher);
      if (found.length != 3) {
          throw new Error("Subkey '" + part + "' is not valid. (" + key + ")");
      }
      var name = found[1];
      var index = found[2];
      
      if (name.length == 0) {
          throw new Error("Subkey '" + part + "' is not a valid key, it must have a name in addition to an array subscript. (" + key + ")");
      }
      
      if ( index === undefined ) {
          throw new Error("You must specify an array index when using get(), subkey '" + part + "' is invalid. (" + key + ")" );
      } else {
          index = parseInt(index);
      }

      if (!obj.hasOwnProperty(name) || !isArray(obj[name])) {
          return def;
      }
      if (index > obj[name].length - 1) {
          return def;
      }
      obj = obj[name][index];
      continue;
    } else if (!obj.hasOwnProperty(part)) {
      return def;
    }
    obj = obj[part];
  }

  return obj;
}

Accessors.set = function (obj, key, val) {
  if (typeof(obj) !== "object") {
    throw new TypeError("Object to access must be an object.");
  }
  if (typeof(key) !== "string") {
    throw new TypeError("Key to access must be a string.");
  }
  if (/(^\.|\.$|\.\.)/.test(key)) {
    throw new Error("Given key is invalid.");
  }

  var parts = key.split(".");

  for (var i = 0; i < parts.length; i++) {
    var isKey = (i == (parts.length - 1));
    var part = parts[i];
    if (/\[/.test(part)) {
      var found = part.match(arraymatcher);
      if (found.length != 3) {
          throw new Error("Subkey '" + part + "' is not a valid array accessor. (" + key + ")");
      }
      var name = found[1];
      var index = found[2];
      
      if (name.length == 0) {
          throw new Error("Subkey '" + part + "' is not a valid key, it must have a name in addition to an array subscript. (" + key + ")");
      }
      
      if ( index === undefined ) {
          index = (obj.hasOwnProperty(name) && isArray(obj[name])) ? obj[name].length : 0;
      } else {
          index = parseInt(index);
      }

      if (obj.hasOwnProperty(name)) {
          if (!isArray(obj[name])) {
              throw new Error("Subkey '" + part + "' is not valid because '" + name + "' is not an array. (" + key + ")");
          } else if (index === undefined ) {
              
          } else if (index > obj[name].length - 1) {
              var sizeNeeded = (index - obj[name].length) + 1;
              obj[name] = obj[name].concat(new Array(sizeNeeded));
              obj = obj[name][index] = isKey ? val : {};
          } else {
              if (isKey) {
                  obj[name][index] = val;
              } else {
                  obj = obj[name][index];
              }
          }
      } else {
          obj[name] = new Array(index + 1);
          obj = obj[name][index] = isKey ? val : {};
      }
      continue;
    } else if (typeof(obj) !== "object" || isArray(obj)) {
      var bt = parts.slice(0, i).join(".");
      throw new Error("Part '" + bt + ".' of the given key is not an object.");
    } else if (!obj.hasOwnProperty(part)) {
      obj[part] = isKey ? val : {};
      obj = obj[part];
    } else {
      if (isKey) {
        obj[part] = val;
      } else {
        obj = obj[part];
      }
    }
  }
}

