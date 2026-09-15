'use strict';

const ranPrettier = require('@rocketsarenostalgic/quality-config/prettier');

module.exports = {
	...ranPrettier,
	overrides: [
		...(ranPrettier.overrides || []),
		{
			// Release Please's JSON updater emits this metadata array multiline.
			files: 'blocks/media/video-cover/block.json',
			options: {
				printWidth: 60,
			},
		},
	],
};
