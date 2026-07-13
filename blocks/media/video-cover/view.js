( function () {
	const STORAGE_KEY = 'ranVideoCoverMotion';
	const STATE_PAUSED = 'paused';
	const STATE_PLAYING = 'playing';

	function isValidMotionState( state ) {
		return state === STATE_PAUSED || state === STATE_PLAYING;
	}

	function getCookieMotionState() {
		try {
			const cookies = document.cookie ? document.cookie.split( ';' ) : [];
			const prefix = encodeURIComponent( STORAGE_KEY ) + '=';

			for ( let index = 0; index < cookies.length; index++ ) {
				const cookie = cookies[ index ].trim();

				if ( cookie.indexOf( prefix ) !== 0 ) {
					continue;
				}

				const state = decodeURIComponent(
					cookie.slice( prefix.length )
				);

				if ( isValidMotionState( state ) ) {
					return state;
				}
			}
		} catch ( error ) {
			return '';
		}

		return '';
	}

	function getStoredMotionState() {
		try {
			const state = window.localStorage.getItem( STORAGE_KEY );

			if ( isValidMotionState( state ) ) {
				return state;
			}
		} catch ( error ) {
			// Storage can be unavailable in private or locked-down contexts.
		}

		return getCookieMotionState();
	}

	function setStoredMotionState( isPaused ) {
		const state = isPaused ? STATE_PAUSED : STATE_PLAYING;

		try {
			window.localStorage.setItem( STORAGE_KEY, state );
		} catch ( error ) {
			// Storage can be unavailable in private or locked-down contexts.
		}

		try {
			document.cookie =
				encodeURIComponent( STORAGE_KEY ) +
				'=' +
				encodeURIComponent( state ) +
				';path=/;max-age=31536000;SameSite=Lax';
		} catch ( error ) {
			// Cookies can also be disabled; the control still works for this page.
		}
	}

	function shouldStartPaused( prefersReducedMotion ) {
		const state = getStoredMotionState();

		if ( state === STATE_PAUSED ) {
			return true;
		}

		if ( state === STATE_PLAYING ) {
			return false;
		}

		return prefersReducedMotion;
	}

	function setButtonState( root, isPaused ) {
		const button = root.querySelector( '.ran-video-cover__toggle' );

		if ( ! button ) {
			return;
		}

		const label = button.querySelector( '.ran-video-cover__toggle-label' );
		const playLabel =
			button.getAttribute( 'data-play-label' ) || 'Play animation';
		const pauseLabel =
			button.getAttribute( 'data-pause-label' ) || 'Pause animation';
		const nextLabel = isPaused ? playLabel : pauseLabel;

		button.setAttribute( 'aria-pressed', isPaused ? 'true' : 'false' );
		button.setAttribute( 'aria-label', nextLabel );

		if ( label ) {
			label.textContent = nextLabel;
		}
	}

	function pauseVideo( root, video, reset ) {
		video.removeAttribute( 'autoplay' );
		video.pause();

		if ( reset ) {
			video.currentTime = 0;
		}

		root.classList.add( 'is-paused' );
		setButtonState( root, true );
	}

	function playVideo( root, video ) {
		video.setAttribute( 'autoplay', '' );
		const playAttempt = video.play();

		root.classList.remove( 'is-paused' );
		setButtonState( root, false );

		if ( playAttempt && playAttempt.catch ) {
			playAttempt.catch( function () {
				pauseVideo( root, video, false );
			} );
		}
	}

	function setSiteMotionState( isPaused, persist ) {
		const banners = document.querySelectorAll(
			'.wp-block-ran-video-cover'
		);

		if ( persist ) {
			setStoredMotionState( isPaused );
		}

		for ( let index = 0; index < banners.length; index++ ) {
			const root = banners[ index ];
			const video = root.querySelector( '.ran-video-cover__media' );

			if ( ! video || 'VIDEO' !== video.tagName ) {
				continue;
			}

			if ( isPaused ) {
				pauseVideo( root, video, true );
			} else {
				playVideo( root, video );
			}
		}
	}

	function initBanner( root, isPaused ) {
		if ( root.dataset.ranVideoCoverReady ) {
			return;
		}

		root.dataset.ranVideoCoverReady = 'true';

		const video = root.querySelector( '.ran-video-cover__media' );

		if ( ! video || 'VIDEO' !== video.tagName ) {
			return;
		}

		if ( isPaused ) {
			pauseVideo( root, video, true );
		} else {
			playVideo( root, video );
		}
	}

	function handleToggleEvent( event ) {
		const button = event.target.closest( '.ran-video-cover__toggle' );

		if ( ! button ) {
			return;
		}

		if (
			event.type === 'keydown' &&
			event.key !== 'Enter' &&
			event.key !== ' '
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		toggleBanner( button );
	}

	function toggleBanner( button ) {
		const root = button.closest(
			'.wp-block-ran-video-cover, .ran-video-cover'
		);

		if ( ! root ) {
			return;
		}

		const video = root.querySelector( '.ran-video-cover__media' );

		if ( ! video || 'VIDEO' !== video.tagName ) {
			return;
		}

		setSiteMotionState(
			button.getAttribute( 'aria-pressed' ) !== 'true',
			true
		);
	}

	function init() {
		const mediaQuery =
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const prefersReducedMotion = !! ( mediaQuery && mediaQuery.matches );
		const isPaused = shouldStartPaused( prefersReducedMotion );
		const banners = document.querySelectorAll(
			'.wp-block-ran-video-cover'
		);

		for ( let index = 0; index < banners.length; index++ ) {
			initBanner( banners[ index ], isPaused );
		}

		document.addEventListener( 'click', handleToggleEvent, true );
		document.addEventListener( 'keydown', handleToggleEvent, true );
		window.addEventListener( 'storage', function ( event ) {
			if ( event.key !== STORAGE_KEY ) {
				return;
			}

			const state = getStoredMotionState();

			if ( state === STATE_PAUSED || state === STATE_PLAYING ) {
				setSiteMotionState( state === STATE_PAUSED, false );
			}
		} );
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
