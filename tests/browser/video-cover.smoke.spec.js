const { expect, test } = require( '@playwright/test' );

const fixtureUrl = process.env.RAN_VIDEO_COVER_E2E_URL;
const staticFixtureUrl = process.env.RAN_VIDEO_COVER_STATIC_E2E_URL;
const surfaceFixtureUrl = process.env.RAN_VIDEO_COVER_SURFACE_E2E_URL;

test( 'a reduced-motion visitor receives a paused, labelled video control', async ( {
	page,
} ) => {
	test.skip(
		! fixtureUrl,
		'Set RAN_VIDEO_COVER_E2E_URL to a published post containing a video Video Cover block.'
	);

	await page.emulateMedia( { reducedMotion: 'reduce' } );
	await page.goto( fixtureUrl );

	const cover = page.locator( '.wp-block-ran-enhanced-cover' ).first();
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
	test.skip(
		! fixtureUrl,
		'Set RAN_VIDEO_COVER_E2E_URL to a published post containing a video Video Cover block.'
	);

	const context = await browser.newContext( { javaScriptEnabled: false } );
	const page = await context.newPage();

	await page.goto( fixtureUrl );

	const cover = page.locator( '.wp-block-ran-enhanced-cover' ).first();
	const video = cover.locator( 'video.ran-video-cover__media' );

	await expect( cover ).toHaveClass( /is-paused/ );
	await expect( video ).not.toHaveAttribute( 'autoplay', '' );
	await expect(
		cover.getByRole( 'button', { name: 'Play animation' } )
	).toBeVisible();

	await context.close();
} );

test( 'a video cover requests the player runtime', async ( { page } ) => {
	test.skip(
		! fixtureUrl,
		'Set RAN_VIDEO_COVER_E2E_URL to a published post containing a video Video Cover block.'
	);

	const runtimeRequests = [];
	page.on( 'request', ( request ) => {
		if (
			/\/build\/blocks\/media\/video-cover\/view\.js(?:\?|$)/.test(
				request.url()
			)
		) {
			runtimeRequests.push( request.url() );
		}
	} );

	await page.goto( fixtureUrl, { waitUntil: 'load' } );

	await expect(
		page
			.locator(
				'.wp-block-ran-enhanced-cover video.ran-video-cover__media'
			)
			.first()
	).toBeVisible();
	expect( runtimeRequests ).toHaveLength( 1 );
} );

test( 'a poster-only or empty cover omits player controls and runtime', async ( {
	page,
} ) => {
	test.skip(
		! staticFixtureUrl,
		'Set RAN_VIDEO_COVER_STATIC_E2E_URL to a published post containing a poster-only or empty Video Cover block.'
	);

	const runtimeRequests = [];
	page.on( 'request', ( request ) => {
		if (
			/\/build\/blocks\/media\/video-cover\/view\.js(?:\?|$)/.test(
				request.url()
			)
		) {
			runtimeRequests.push( request.url() );
		}
	} );

	await page.goto( staticFixtureUrl, { waitUntil: 'load' } );

	const cover = page.locator( '.wp-block-ran-enhanced-cover' ).first();
	await expect( cover.locator( 'video.ran-video-cover__media' ) ).toHaveCount(
		0
	);
	await expect( cover.locator( '.ran-video-cover__toggle' ) ).toHaveCount(
		0
	);
	expect( runtimeRequests ).toEqual( [] );
} );

test( 'a transparent-media cover retains its independent brand-purple surface', async ( {
	page,
} ) => {
	test.skip(
		! surfaceFixtureUrl,
		'Set RAN_VIDEO_COVER_SURFACE_E2E_URL to a transparent-media Video Cover with the brand-purple background colour.'
	);

	await page.goto( surfaceFixtureUrl, { waitUntil: 'load' } );

	const cover = page.locator( '.wp-block-ran-enhanced-cover' ).first();
	const style = await cover.getAttribute( 'style' );

	expect( style ).toContain(
		'--ran-video-cover-background:var(--wp--preset--color--brand-purple, transparent);'
	);
	await expect( cover.locator( '.ran-video-cover__wash' ) ).toHaveCount( 1 );
} );
