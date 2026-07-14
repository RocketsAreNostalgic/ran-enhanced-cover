const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const addViewScriptEntry = ( config ) => ( {
	...config,
	// Release assets are committed without source maps, matching the existing build.
	devtool: false,
	entry: async () => ( {
		...( await config.entry() ),
		'media/video-cover/view': path.resolve(
			__dirname,
			'blocks/media/video-cover/view.js'
		),
	} ),
} );

module.exports = Array.isArray( defaultConfig )
	? [ addViewScriptEntry( defaultConfig[ 0 ] ), ...defaultConfig.slice( 1 ) ]
	: addViewScriptEntry( defaultConfig );
