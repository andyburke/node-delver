# Delver

Read and update nested objects using simple patterns.

# Examples

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

# Why would I need this?

One example is to allow for more succinct REST requests.

Let's say you have an object of type 'foo' with id '123'. It looks like this:

```
{
    "name": "bloop",
    "media": {
        "photos": [
            {
                "url": "http://somewhere.com/images/turtle.jpg",
                "preview": "http://somewhere.com/images/turtle-preview.jpg",
                "width": 50,
                "height": 50
            },
            {
                "url": "http://somewhere.com/images/snake.jpg",
                "preview": "http://somewhere.com/images/snake-preview.jpg",
                "width": 50,
                "height": 50
            }
        ]
    }
}
```

Now, let's say you want to update the width of the snake picture to be 100 instead of 50.
Because your server-side setup doesn't allow dot notation access, maybe you need to send
back the entire array of photos with the new updated value:

```
curl http://somewhere.com/foo/123
  -X PUT
  -H 'Content-Type: application/json'
  -H 'Accept: application/json'
  --data-binary '{
    "media": {
        "photos": [
            {
                "url": "http://somewhere.com/images/turtle.jpg",
                "preview": "http://somewhere.com/images/turtle-preview.jpg",
                "width": 50,
                "height": 50
            },
            {
                "url": "http://somewhere.com/images/snake.jpg",
                "preview": "http://somewhere.com/images/snake-preview.jpg",
                "width": 100,
                "height": 50
            }
        ]
    }
  }'
```

But with Delver on the server, you could send:

```
curl http://somewhere.com/foo/123
  -X PUT
  -H 'Content-Type: application/json'
  -H 'Accept: application/json'
  --data-binary '{
    "media.photos[1].width": 100
  }'
```

And then in your node.js server, Delver will let you find the appropriate field in
the 'foo' object and update it directly.

# Methods

new Devler( object )
-----------------

Creates a Delver instance with an object to operate on.

.get( key, defaultValue )
-----------------------

Returns the internal object's value at the given `key` if found, else returns `defaultValue`.

If called with no arguments, will return the bare internal object.

.set( key, value )
----------------

Sets the internal object's value to `value` at the given `key` and overrides it if it already exists.

Delver.get( object, key, defaultValue] )
----------------------------------------

Returns the given `object`'s value at the given `key` if found, else returns `defaultValue`.

Delver.set( object, key, value )
---------------------------------

Sets the given `object`'s value to `value` at the given `key` and overrides it if it already exists.

# Install

With [npm](https://npmjs.org) do:

```
npm install delver
```

For [component](http://component.io) do:

```
component install andyburke/node-delver
```

# License

MIT

# Changelog

0.0.11
------
* Cleanups, adding in .jshint (not everything yet passes) and .jsbeautifier settings
* Some more tests for broken deep link chains

0.0.10
-----
* Add ability to get internal object via .get() with no arguments
* Fix up jshint warnings

0.0.9
-----
* Fix a silly bug in .get

0.0.8
-----
* Special-case adding a single item to an array to help with some specific cases where .push() is
  preferred to using concat

0.0.7
-----
* Allow specifying a constructor to use

0.0.6
-----
* Fix some issues when reading from nonexistent items

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

# Credits

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
