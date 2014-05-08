# Delver

Read and update nested objects using simple patterns.

# examples

## get

```javascript
    var Delver = require( 'delver' );

    var obj = {
        foo: {
            bar: 'value',
            arr: [ 1, 2, 3 ]
        }
    };

    var delver = new Delver( obj );

    console.log( delver.get( 'foo.bar' ) );
    console.log( delver.get( 'foo.bar2', 'default' ) );
    console.log( delver.get( 'foo.arr[1]' ) );

    // You don't actually need a Delver instance.
    console.log( Delver.get( obj, 'foo.bar' ) );
    console.log( Delver.get( obj, 'foo.bar2' ) );
    console.log( Delver.get( obj, 'foo.arr[1]' ) );
```

output:

```
    value
    default
    2
    value
    undefined
    2
```

## set

```javascript
    var Delver = require( 'delver' );

    var obj = {};
    var delver = new Delver( obj );

    delver.set( 'foo.bar', 'value' );
    console.log( delver.get( 'foo.bar' ) );

    delver.set( 'foo.baz[]', 'value1' );
    delver.set( 'foo.baz[]', 'value2' );

    // You don't actually need a Delver instance.
    Delver.set( obj, 'foo.baz[]', 'value3' );

    console.log( delver.get( 'foo.baz' ) );
```

output:

```
    value
    [ 'value1', 'value2', 'value3' ]
```

# methods

new Devler( object )
-----------------

Creates a Delver instance with an object to operate on.

.get( key, defaultValue )
-----------------------

Returns the internal object's value at the given `key` if found, else returns `defaultValue`.

.set( key, value )
----------------

Sets the internal object's value to `value` at the given `key` and overrides it if it already exists.

Delver.get( object, key, defaultValue )
----------------------------------------

Returns the given `object`'s value at the given `key` if found, else returns `defaultValue`.

Delver.set( object, key, value )
---------------------------------

Sets the given `object`'s value to `value` at the given `key` and overrides it if it already exists.

# install

With [npm](https://npmjs.org) do:

```
npm install delver
```

# license

MIT

# changelog

0.0.5
-----
* Rename to Delver
* Refactor get/set to use a single traversal method
* Allow for strict/unstrict access (respects/doesn't respect hasOwnProperty)

0.0.4
-----
* Add component support

0.0.3
-----
* Allow for array element access

# credits

Delver is based off a fork of Tim Taubert's [node-accessors](https://github.com/ttaubert/node-accessors). Many
thanks to him for a great little library.

Delver was created to enable a couple of additional features:
  * array level element access, eg:
  
  ```javascript
      Delver.get( obj, 'foo.bar[3]' ); // get element with index 3 of array 'bar'
      Delver.set( obj, 'foo.bar[4].baz', 'yak' ); // set field 'baz' of element with index 4 of array 'bar'
  ```
  
  * allow for a less strict traversal of objects
    * specifically, I needed to support [mongoose](http://mongoosejs.com/) objects which have accessors instead of hasOwnProperty()-checkable members
  * add ability to enable/disable automatic path creation
