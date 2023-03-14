/*
*   Wavify
*   Jquery Plugin to make some nice waves
*   by peacepostman @ crezeo
*/

(function ( $ ) {

	$.fn.wavify = function( options ) {
		if( 'function' !== typeof wavify )
		{
			console.error( "wavify is not a function. Be sure to include 'wavify.dist' before you include 'jquery.wavify.dist'." )
			throw( "Error: wavify is not a function")
		}

		return wavify( this, options );
	};

}(jQuery));
