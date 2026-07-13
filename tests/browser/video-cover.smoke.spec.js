const { expect, test } = require( '@playwright/test' );

const fixtureUrl = process.env.RAN_VIDEO_COVER_E2E_URL;

test.skip(
	! fixtureUrl,
	'Set RAN_VIDEO_COVER_E2E_URL to a published post containing a Video Cover block.'
);

test( 'a reduced-motion visitor receives a paused, labelled video control', async ( {
	page,
} ) => {
	await page.emulateMedia( { reducedMotion: 'reduce' } );
	await page.goto( fixtureUrl );

	const cover = page.locator( '.wp-block-ran-video-cover' ).first();
	const video = cover.locator( 'video.ran-video-cover__media' );
	const control = cover.getByRole( 'button', { name: 'Play animation' } );

	await expect( cover ).toHaveClass( /is-paused/ );
	await expect( video ).not.toHaveAttribute( 'autoplay', '' );
	await expect( video ).toHaveAttribute( 'aria-hidden', 'true' );
	await expect( control ).toBeVisible();
	await control.focus();
	await expect( control ).toBeFocused();
	expect( await video.evaluate( ( element ) => element.paused ) ).toBe(
		true
	);
} );

test( 'the no-JavaScript response remains understandable and paused', async ( {
	browser,
} ) => {
	const context = await browser.newContext( { javaScriptEnabled: false } );
	const page = await context.newPage();

	await page.goto( fixtureUrl );

	const cover = page.locator( '.wp-block-ran-video-cover' ).first();
	const video = cover.locator( 'video.ran-video-cover__media' );

	await expect( cover ).toHaveClass( /is-paused/ );
	await expect( video ).not.toHaveAttribute( 'autoplay', '' );
	await expect(
		cover.getByRole( 'button', { name: 'Play animation' } )
	).toBeVisible();

	await context.close();
} );
