// https://github.com/ttaubert/node-accessors
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// accessors may be freely distributed under the MIT license.

"use strict";

module.exports = Accessors;

function Accessors(obj) {
  if (!(this instanceof Accessors)) {
    return new Accessors(obj);
  }

  if (typeof(obj) !== "object") {
    throw new TypeError("Object to access must be an object.");
  }

  this.object = obj;
}

Accessors.prototype = {
  get: function (key, def) {
    if (typeof(key) !== "string") {
      throw new TypeError("Key to access must be a string.");
    }
    if (/(^\.|\.$|\.\.|[\[\]])/.test(key)) {
      throw new Error("Given key is invalid.");
    }

    var obj = this.object;
    var parts = key.split(".");

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!obj.hasOwnProperty(part)) {
        return def;
      }
      obj = obj[part];
    }

    return obj;
  },

  set: function (key, val) {
    if (typeof(key) !== "string") {
      throw new TypeError("Key to access must be a string.");
    }
    if (/(^\.|\.$|\.\.)/.test(key)) {
      throw new Error("Given key is invalid.");
    }
    if (!/(^[^\[\]]+$|^[^\[\]]*[^\.\[\]]\[\]$)/.test(key)) {
      throw new Error("Given key is invalid.");
    }

    var obj = this.object;
    var parts = key.split(".");
    key = parts.splice(-1, 1)[0];

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!obj.hasOwnProperty(part)) {
        obj[part] = {};
      } else if (typeof(obj[part]) !== "object" || isArray(obj[part])) {
        var bt = parts.slice(0, i + 1).join(".");
        throw new Error("Part '" + bt + ".' of the given key is not an object.");
      }
      obj = obj[part];
    }

    if (/\[\]$/.test(key)) {
      key = key.slice(0, -2);
      if (!obj.hasOwnProperty(key)) {
        obj[key] = [];
      }
      if (!isArray(obj[key])) {
        throw new Error("Key '" + key + "' exists but is not an array.");
      }
      obj[key].push(val);
    } else {
      obj[key] = val;
    }
  }
};

Accessors.get = function (obj, key, def) {
  return Accessors(obj).get(key, def);
};

Accessors.set = function (obj, key, val) {
  Accessors(obj).set(key, val);
};

function isArray(obj) {
  if (Array.isArray) {
    return Array.isArray(obj);
  }

  return Object.prototype.toString.call(obj) === "[object Array]";
}
