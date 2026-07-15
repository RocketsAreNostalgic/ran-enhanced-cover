const { defineConfig } = require( '@playwright/test' );

module.exports = defineConfig( {
	testDir: __dirname,
	fullyParallel: false,
	use: {
		baseURL: process.env.RAN_ENHANCED_COVER_E2E_URL,
		headless: true,
	},
} );
