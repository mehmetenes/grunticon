/*
 * img-stats
 * https://github.com/jlembeck/img-stats
 *
 * Copyright (c) 2013 Jeffrey Lembeck
 * Licensed under the MIT license.
 */

/*global require:true*/

(function(exports) {
	"use strict";
	var fs = require( 'fs' );
	var DOMParser = require( 'xmldom' ).DOMParser;

	var isPng = function( data ){
		var d = data.slice(0, 16);
		return d === "89504e470d0a1a0a";
	};

	var isSVG = function( data ){
		for( var i=0, l = data.length; i < l; i++ ){
			var d = data.slice(i, i+2).toString( 'hex' );
			if( d === "73" ){
				i=i+2;
				d = data.slice( i, i+2 ).toString( 'hex' );
				if( d === "76" ){
					i=i+2;
					d = data.slice( i, i+2 ).toString( 'hex' );
					if( d === "67" ){
						return true;
					}
				}
			}
		}
		return false;
	};


	var padHexStringToTwoDigits = function( num ) {
		return ( num.length === 1 ? "0" : "" ) + num;
	};

	exports.stats = function( filename , callback ) {
		var ret = {};
		if( !filename ){ throw new Error("Needs a filename"); }
		var data,
			hexData = [],
			hexString = "";

		if( fs.readFileSync ) {
			data = fs.readFileSync( filename );
			hexString = data.toString( "hex" );
		} else {
			// PhantomJS compatible
			data = fs.open( filename, "r+b" ).read();
			for(var j=0, k=data.length; j<k; j++) {
				hexData.push( padHexStringToTwoDigits( data.charCodeAt(j).toString(16) ));
			}
			hexString = hexData.join("");
		}

		if( isPng( hexString ) ){
			var i = 16,
				l;
			for( l = hexString.length; i < l; i++ ){
				var d = hexString.slice(i, i+8);
				if( d === "49484452" ){
					i = i+8;
					break;
				}
			}

			ret.width = parseInt(hexString.slice( i, i+8 ).toString( 16 ) , 16 );
			i = i+8;
			ret.height = parseInt(hexString.slice( i, i+8 ).toString( 16 ) , 16 );
			ret.type = "PNG";

		} else if( isSVG( hexString ) ){
			ret.type = "SVG";
		}
		callback( ret );
	};

	exports.statsSync = function( filename ){
		var ret = {};
		if( !filename ){ throw new Error("Needs a filename"); }
			var data = fs.readFileSync( filename ),
				hexString = "";

			hexString = data.toString( "hex" );

		if( isPng( hexString ) ){
			var i = 16,
				l;
			for( l = hexString.length; i < l; i++ ){
				var d = hexString.slice(i, i+8);
				if( d === "49484452" ){
					i = i+8;
					break;
				}
			}

			ret.width = parseInt(hexString.slice( i, i+8 ).toString( 16 ) , 16 );
			i = i+8;
			ret.height = parseInt(hexString.slice( i, i+8 ).toString( 16 ) , 16 );
			ret.type = "PNG";

		} else if( isSVG( hexString ) ){
			ret.type = "SVG";
			var doc = new DOMParser().parseFromString( data.toString( 'utf-8' ) );
			ret.width = doc.documentElement.getAttribute( 'width' );
			ret.height = doc.documentElement.getAttribute( 'height' );
		}

		return ret;
	};

}(typeof exports === 'object' && exports || this));
