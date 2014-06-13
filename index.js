// https://github.com/andyburke/node-delver
// delver may be freely distributed under the MIT license.

/* jshint node: true */
"use strict";

module.exports = Delver;

function Delver( obj ) {
    this._object = obj;
    return this;
}

Delver.prototype.get = function( key, _default ) {
    if ( !key ) {
        return this._object;
    }
    return Delver.get( this._object, key, _default );
};

Delver.prototype.set = function( key, value ) {
    return Delver.set( this._object, key, value );
};

var isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var arraymatcher = /^(.*?)\[(\d+)?\]$/;

function getSubkey( parts, pos ) {
    return parts.slice( 0, pos ).join( "." );
}

/*******************************************************
 * we need a lightweight 'accessor' because Javascript
 * sadly does not support pointers to primitives. It would
 * be much nicer if the traverser could return a pointer to
 * the value you're trying to get/set.
 *******************************************************/
function Accessor( obj, key ) {
    this._object = obj;
    this._key = key;
}

Accessor.prototype.get = function() {
    return this._object[ this._key ];
};

Accessor.prototype.set = function( value ) {
    return ( this._object[ this._key ] = value );
};

function delve( options ) {
    if ( typeof( options.object ) !== 'object' )
    {
        throw new TypeError( 'Object to access must be an object.' );
    }

    if ( typeof( options.key ) !== 'string' )
    {
        throw new TypeError( 'Key to access must be a string.' );
    }

    var obj = options.object;
    var parts = options.key.split( '.' );

    for ( var i = 0; i < parts.length; ++i )
    {
        var isKey = ( i == ( parts.length - 1 ) );
        var part = parts[ i ];

        if ( typeof( part ) != 'string' || part.length === 0 )
        {
            throw new Error( 'Key is invalid: ' + options.key );
        }

        var exists = options.strict ? obj.hasOwnProperty( part ) : typeof( obj[ part ] ) !== 'undefined';

        if ( /\[/.test( part ) )
        {
            var found = part.match( arraymatcher );
            if ( found.length != 3 )
            {
                throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not a valid array accessor. (" + options.key + ")" );
            }

            var name = found[ 1 ];
            var index = found[ 2 ];

            if ( name.length === 0 )
            {
                throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not a valid key, it must have a name in addition to an array subscript. (" + options.key + ")" );
            }

            exists = options.strict ? obj.hasOwnProperty( name ) : typeof( obj[ name ] ) !== 'undefined';

            if ( index === undefined )
            {
                if ( options.read )
                {
                    throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not a valid key, it must have a valid array index when reading. (" + options.key + ")" );
                }

                index = ( exists && isArray( obj[ name ] ) ) ? obj[ name ].length : 0;
            }
            else
            {
                index = parseInt( index );
            }

            if ( exists )
            {
                if ( !isArray( obj[ name ] ) )
                {
                    throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not valid because '" + name + "' is not an array. (" + options.key + ")" );
                }
                else if ( index > obj[ name ].length - 1 )
                {
                    if ( !options.create )
                    {
                        if ( options.read )
                        {
                            return undefined;
                        }

                        throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not valid because index '" + index + "' is out of bounds and create is not enabled. (" + options.key + ")" );
                    }

                    var sizeNeeded = ( index - obj[ name ].length ) + 1;

                    // special case for pushing one item since some libraries override push
                    if ( sizeNeeded == 1 )
                    {
                        // if this is the key, we push the value; however, the value will get overwritten
                        // by the accessor after the callback. we push the value because some libraries
                        // expect the value to be of a certain type and pushing null may cause issues
                        obj[ name ].push( isKey ? options.value : null );
                    }
                    else
                    {
                        obj[ name ] = obj[ name ].concat( new Array( sizeNeeded ) );
                    }

                    if ( isKey )
                    {
                        return new Accessor( obj[ name ], index );
                    }
                    else
                    {
                        obj = obj[ name ][ index ] = {};
                    }
                }
                else
                {
                    if ( isKey )
                    {
                        return new Accessor( obj[ name ], index );
                    }
                    else
                    {
                        obj = obj[ name ][ index ];
                    }
                }
            }
            else if ( options.create )
            {
                obj[ name ] = new Array( index + 1 );
                if ( isKey )
                {
                    return new Accessor( obj[ name ], index );
                }
                else
                {
                    obj = obj[ name ][ index ] = {};
                }
            }
            else
            {
                if ( options.read )
                {
                    return undefined;
                }
                else
                {
                    throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not valid because it does not exist and create is not enabled. (" + options.key + ")" );
                }
            }

            continue;
        }
        else if ( typeof( obj ) !== "object" )
        {
            throw new Error( "Part '" + getSubkey( parts, i ) + ".' of the given key is not an object." );
        }
        else if ( isArray( obj ) )
        {
            throw new Error( "Part '" + getSubkey( parts, i ) + ".' of the given key is an array, but has no index accessor ([])." );
        }
        else if ( !exists )
        {
            if ( isKey )
            {
                if ( options.read )
                {
                    return undefined;
                }

                return new Accessor( obj, part );
            }

            if ( options.read )
            {
                return undefined;
            }

            if ( !options.create )
            {
                throw new Error( "Subkey '" + getSubkey( parts, i ) + "' is not valid because it does not exist and create is not enabled. (" + options.key + ")" );
            }

            obj = obj[ part ] = {};
        }
        else
        {
            if ( isKey )
            {
                return new Accessor( obj, part );
            }
            else
            {
                obj = obj[ part ];
            }
        }
    }

    throw Error( 'Failed to resolve: ' + options.key );
}

Delver.get = function( obj, key, _default ) {
    var strict = true;

    if ( typeof( key ) == 'undefined' )
    {
        key = obj.key;
        strict = typeof( obj.strict ) !== 'undefined' ? obj.strict : strict;
        _default = obj._default;
        obj = obj.object;
    }

    var accessor = delve( {
        read: true,
        strict: strict,
        object: obj,
        key: key
    } );

    if ( accessor === undefined )
    {
        return _default;
    }

    return accessor.get();
};

Delver.set = function( obj, key, val, create ) {
    var strict = true;

    var _constructor = null;
    if ( typeof( key ) == 'undefined' )
    {
        key = obj.key;
        val = obj.value;
        create = obj.create;
        strict = typeof( obj.strict ) !== 'undefined' ? obj.strict : strict;
        _constructor = obj._constructor;
        obj = obj.object;
    }

    var accessor = delve( {
        strict: strict,
        create: typeof( create ) !== 'undefined' ? create : true,
        object: obj,
        key: key,
        value: val
    } );

    return accessor.set( _constructor ? _constructor( val ) : val );
};
