# accessors

Read and update (nested) objects using simple patterns.

[![browser support](http://ci.testling.com/ttaubert/node-accessors.png)](http://ci.testling.com/ttaubert/node-accessors)

[![build status](https://secure.travis-ci.org/ttaubert/node-accessors.png)](http://travis-ci.org/ttaubert/node-accessors)

# examples

## get

    var Accessors = require("accessors");

    var obj = {foo: {bar: "value", arr: [ 1, 2, 3 ]}};
    var acc = Accessors(obj);

    console.log(acc.get("foo.bar"));
    console.log(acc.get("foo.bar2", "default"));
    console.log(acc.get("foo.arr[1]"));

    // You don't actually need an Accessors instance.
    console.log(Accessors.get(obj, "foo.bar"));
    console.log(Accessors.get(obj, "foo.bar2"));
    console.log(Accessors.get(obj, "foo.arr[1]"));

output:

    $ node examples/acc-get.js
    value
    default
    2
    value
    undefined
    2

## set

    var Accessors = require("accessors");

    var obj = {};
    var acc = Accessors(obj);

    acc.set("foo.bar", "value");
    console.log(acc.get("foo.bar"));

    acc.set("foo.baz[]", "value1");
    acc.set("foo.baz[]", "value2");

    // You don't actually need an Accessors instance.
    Accessors.set(obj, "foo.baz[]", "value3");

    console.log(acc.get("foo.baz"));

output:

    $ node examples/acc-set.js
    value
    [ 'value1', 'value2', 'value3' ]

# methods

Accessors(object)
-----------------

Creates an Accessor instance with an object to operate on.

.get(key, defaultValue)
-----------------------

Returns the internal object's value at the given `key` if found, else returns `defaultValue`.

.set(key, value)
----------------

Sets the internal object's value to `value` at the given `key` and overrides it if it already exists.

Accessors.get(object, key, defaultValue)
----------------------------------------

Returns the given `object`'s value at the given `key` if found, else returns `defaultValue`.

Accessors.set(object, key, value)
---------------------------------

Sets the given `object`'s value to `value` at the given `key` and overrides it if it already exists.

# install

With [npm](https://npmjs.org) do:

```
npm install accessors
```

# license

MIT

