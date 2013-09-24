// https://github.com/ttaubert/node-accessors
// (c) 2013 Tim Taubert <tim@timtaubert.de>
// accessors may be freely distributed under the MIT license.

"use strict";

var test = require("tape");
var acc = require("../");

test("get", function (t) {
  var obj = {foo: {bar: "value"}};
  t.equal(acc.get(obj, "foo.bar"), "value");

  var obj = {foo: {bar: {baz: "value"}}};
  t.equal(acc.get(obj, "foo.bar.baz"), "value");
  t.equal(acc.get(obj, "foo.bar.baz2"), void 0);

  var obj = {foo: {bar: {baz: void 0}}};
  t.equal(acc.get(obj, "foo.bar.baz", "fallback"), void 0);

  var obj = {foo: {bar: {baz: "value"}}};
  t.equal(acc.get(obj, "foo.bar.baz2", "fallback"), "fallback");
  t.equal(acc.get(obj, "foo2.bar.baz", "fallback"), "fallback");

  var obj = {foo: {}};
  t.equal(acc.get(obj, "foo.bar", "fallback"), "fallback");
  t.equal(acc.get(obj, "foo.bar", "fallback"), "fallback");

  t.throws(function () {
    acc.get("string", "key");
  });

  t.throws(function () {
    acc.get({}, {split: function () {return []}});
  });

  t.throws(function () {
    acc.get({}, ".");
  });

  t.throws(function () {
    acc.get({}, ".foo.bar");
  });

  t.throws(function () {
    acc.get({}, "foo.bar.");
  });

  t.throws(function () {
    acc.get({}, ".foo..bar");
  });

  t.throws(function () {
    acc.get({}, ".foo...bar");
  });

  t.throws(function () {
    acc.get({}, "foo[]");
  });

  t.throws(function () {
    acc.get({}, "foo[bar]");
  });

  t.end();
});

test("set", function (t) {
  var obj = {};

  acc.set(obj, "foobar", "value");
  t.equal(obj.foobar, "value");

  acc.set(obj, "foo.bar", "value");
  t.equal(obj.foo.bar, "value");

  acc.set(obj, "foo.bar", "value2");
  t.equal(obj.foo.bar, "value2");

  acc.set(obj, "a[]", "value1");
  acc.set(obj, "a[]", "value2");
  t.deepEqual(obj.a, ["value1", "value2"]);

  acc.set(obj, "foo.baz[]", "value1");
  acc.set(obj, "foo.baz[]", "value2");
  t.deepEqual(obj.foo.baz, ["value1", "value2"]);

  acc.set(obj.foo, "baz[]", "value3");
  t.deepEqual(obj.foo.baz, ["value1", "value2", "value3"]);

  t.throws(function () {
    acc.set("string", "key", "value");
  });

  t.throws(function () {
    acc.set({}, {split: function () {return []}}, "value");
  });

  t.throws(function () {
    acc.set({}, ".", "value");
  });

  t.throws(function () {
    acc.set({}, ".foo.bar", "value");
  });

  t.throws(function () {
    acc.set({}, "foo.bar.", "value");
  });

  t.throws(function () {
    acc.set({}, ".foo..bar", "value");
  });

  t.throws(function () {
    acc.set({}, ".foo...bar", "value");
  });

  t.throws(function () {
    acc.set({}, "[]", "value");
  });

  t.throws(function () {
    acc.set({}, ".[]", "value");
  });

  t.throws(function () {
    acc.set({}, "[]test", "value");
  });

  t.throws(function () {
    acc.set({}, "[test]", "value");
  });

  t.throws(function () {
    acc.set({}, "foo[bar]", "value");
  });

  t.throws(function () {
    acc.set({}, "foo[.bar[]", "value");
  });

  t.throws(function () {
    acc.set({}, "foo].bar[]", "value");
  });

  t.throws(function () {
    acc.set({}, "foo.bar.[]", "value");
  });

  t.throws(function () {
    acc.set({}, "foo.bar..[]", "value");
  });

  t.throws(function () {
    acc.set({foo: true}, "foo[]", "value");
  });

  t.throws(function () {
    acc.set({foo: true}, "foo.bar", "value");
  });

  t.throws(function () {
    acc.set({foo: []}, "foo.bar", "value");
  });

  t.end();
});
