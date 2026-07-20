const wordpressConfig = require( '@wordpress/prettier-config' );

module.exports = {
	...wordpressConfig,
	overrides: [
		...wordpressConfig.overrides,
		{
			// Release Please's JSON updater emits this metadata array multiline.
			files: 'blocks/media/video-cover/block.json',
			options: {
				printWidth: 60,
			},
		},
	],
};
