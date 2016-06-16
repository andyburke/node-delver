'use strict';

const test = require( 'tape' );
const delver = require( '../' );

test( 'get single value', function( t ) {
    let obj = {
        foo: {
            bar: 'value'
        }
    };
    t.equal( delver.get( obj, 'foo.bar' ), 'value' );

    t.end();
} );

test( 'get nonexistent value', function( t ) {
    let obj = {
        foo: {
            bar: {
                baz: 'value'
            }
        }
    };
    t.equal( delver.get( obj, 'foo.bar.baz' ), 'value' );
    t.equal( delver.get( obj, 'foo.bar.baz2' ), void 0 );

    t.end();
} );

test( 'get nonexistent deep value', function( t ) {
    let obj = {
        foo: {
            bar: {
                baz: 'value'
            }
        }
    };
    t.equal( delver.get( obj, 'foo.bar.baz' ), 'value' );
    t.equal( delver.get( obj, 'foo.bar2.baz2' ), void 0 );

    t.end();
} );

test( 'get existing with fallback', function( t ) {
    let obj = {
        foo: {
            bar: {
                baz: void 0
            }
        }
    };
    t.equal( delver.get( obj, 'foo.bar.baz', 'fallback' ), void 0 );

    t.end();
} );

test( 'get fallback value', function( t ) {
    let obj = {
        foo: {
            bar: {
                baz: 'value'
            }
        }
    };
    t.equal( delver.get( obj, 'foo.bar.baz2', 'fallback' ), 'fallback' );
    t.equal( delver.get( obj, 'foo.bar2.baz2', 'fallback' ), 'fallback' );

    t.end();
} );

test( 'get from array', function( t ) {
    let obj = {
        foo: {
            bar: [ 1, 2, 3 ]
        }
    };
    t.equal( delver.get( obj, 'foo.bar[1]', 2 ), 2 );
    t.equal( delver.get( obj, 'foo.bar[ 1 ]', 2 ), 2 );
    t.equal( delver.get( obj, 'foo.bar[100]', 'fallback' ), 'fallback' );

    t.end();
} );

test( 'get fallback value when accessing object', function( t ) {
    let obj = {
        foo: {}
    };
    t.equal( delver.get( obj, 'foo.bar', 'fallback' ), 'fallback' );

    t.end();
} );

function TestObj() {}
TestObj.prototype.baz = 'yak';

test( 'get from prototype', function( t ) {
    let obj = {
        foo: {
            bar: new TestObj()
        }
    };

    t.equal( delver.get( {
        object: obj,
        key: 'foo.bar.baz',
        strict: false
    } ), 'yak' );

    t.equal( delver.get( {
        object: obj,
        key: 'foo.bar.baz',
        strict: true,
        _default: 'yak'
    } ), 'yak' );

    t.end();
} );

test( 'test delver instance', function( t ) {
    let delverInstance = new delver( {
        foo: 'baz',
        bar: 'qux'
    } );
    t.equal( 'object', typeof delverInstance.get() );
    t.equal( delverInstance.get().foo, 'baz' );
    t.equal( delverInstance.get().bar, 'qux' );

    t.throws( function() {
        delver.get( 'string', 'key' );
    } );

    t.throws( function() {
        delver.get( {}, {
            split: function() {
                return [];
            }
        } );
    } );

    t.throws( function() {
        delver.get( {}, '.' );
    } );

    t.throws( function() {
        delver.get( {}, '.foo.bar' );
    } );

    t.throws( function() {
        delver.get( {
            foo: {
                bar: {}
            }
        }, 'foo.bar.' );
    } );

    t.throws( function() {
        delver.get( {}, '.foo..bar' );
    } );

    t.throws( function() {
        delver.get( {}, '.foo...bar' );
    } );

    t.throws( function() {
        delver.get( {}, 'foo[]' );
    } );

    t.throws( function() {
        delver.get( {}, 'foo[bar]' );
    } );

    t.end();
} );

test( 'simple set', function( t ) {
    let obj = {};

    delver.set( obj, 'foobar', 'value' );
    t.equal( obj.foobar, 'value' );
    t.end();
} );

test( 'recursive object set', function( t ) {
    let obj = {};

    delver.set( obj, 'foo.bar', 'value' );
    t.equal( obj.foo.bar, 'value' );

    delver.set( obj, 'foo.bar', 'value2' );
    t.equal( obj.foo.bar, 'value2' );

    delver.set( obj, 'foo.blah yak', 'value3' );
    t.equal( obj.foo[ 'blah yak' ], 'value3' );

    t.end();
} );

test( 'set array', function( t ) {
    let obj = {};

    delver.set( obj, 'a[]', 'value1' );
    delver.set( obj, 'a[]', 'value2' );
    t.deepEqual( obj.a, [ 'value1', 'value2' ] );
    t.end();
} );

test( 'set array in object (recursive)', function( t ) {
    let obj = {};
    delver.set( obj, 'foo.baz[]', 'value1' );
    delver.set( obj, 'foo.baz[]', 'value2' );
    t.deepEqual( obj.foo.baz, [ 'value1', 'value2' ] );

    delver.set( obj.foo, 'baz[]', 'value3' );
    t.deepEqual( obj.foo.baz, [ 'value1', 'value2', 'value3' ] );

    delver.set( obj.foo, 'boo[]', 'value1' );
    delver.set( obj.foo, 'boo[]', 'value2' );
    delver.set( obj.foo, 'boo[]', 'value3' );
    t.deepEqual( obj.foo.boo, [ 'value1', 'value2', 'value3' ] );

    delver.set( obj.foo, 'boo[1]', 'fooboo' );
    t.deepEqual( obj.foo.boo, [ 'value1', 'fooboo', 'value3' ] );

    delver.set( obj.foo, 'boo[]', 'another' );
    t.deepEqual( obj.foo.boo, [ 'value1', 'fooboo', 'value3', 'another' ] );

    delver.set( obj, 'foo.boo[]', 'yetanother' );
    t.deepEqual( obj.foo.boo, [ 'value1', 'fooboo', 'value3', 'another', 'yetanother' ] );

    delver.set( obj, 'foo.boo[].yak', 'yes' );
    t.deepEqual( obj.foo.boo, [ 'value1', 'fooboo', 'value3', 'another', 'yetanother', {
        yak: 'yes'
    } ] );

    delver.set( obj, 'foo.boo[5].yak', 'no' );
    t.deepEqual( obj.foo.boo, [ 'value1', 'fooboo', 'value3', 'another', 'yetanother', {
        yak: 'no'
    } ] );

    t.end();
} );

test( 'correct error conditions', function( t ) {
    t.throws( function() {
        delver.set( 'string', 'key', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, {
            split: function() {
                return [];
            }
        }, 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '.', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '.foo.bar', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, 'foo.bar.', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '.foo..bar', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '.foo...bar', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '[]', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '.[]', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '[]test', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, '[test]', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, 'foo[bar]', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, 'foo.bar.[]', 'value' );
    } );

    t.throws( function() {
        delver.set( {}, 'foo.bar..[]', 'value' );
    } );

    t.throws( function() {
        delver.set( {
            foo: true
        }, 'foo[]', 'value' );
    } );

    t.throws( function() {
        delver.set( {
            foo: true
        }, 'foo.bar', 'value' );
    } );

    t.throws( function() {
        delver.set( {
            foo: []
        }, 'foo.bar', 'value' );
    } );

    t.throws( function() {
        delver.get( {}, 'weird[-200],-100.path' );
    }, ex => {
        return typeof ex === 'object' && ex.message && /^Subkey/.test( ex.message );
    } );

    t.end();
} );