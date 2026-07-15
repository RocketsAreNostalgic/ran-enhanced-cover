( function () {
	const STORAGE_KEY = 'ranVideoCoverPaused';

	function getStoredPausePreference() {
		try {
			return 'true' === window.localStorage.getItem( STORAGE_KEY );
		} catch ( error ) {
			// Storage can be unavailable in private or locked-down contexts.
			return false;
		}
	}

	function setStoredPausePreference( isPaused ) {
		try {
			if ( isPaused ) {
				window.localStorage.setItem( STORAGE_KEY, 'true' );
			} else {
				window.localStorage.removeItem( STORAGE_KEY );
			}
		} catch ( error ) {
			// The control continues to work for the current page without storage.
		}
	}

	function setButtonState( root, isPaused ) {
		const button = root.querySelector( '.ran-video-cover__toggle' );

		if ( ! button ) {
			return;
		}

		const label = button.querySelector( '.ran-video-cover__toggle-label' );
		const playLabel = button.getAttribute( 'data-play-label' ) || 'Play';
		const pauseLabel = button.getAttribute( 'data-pause-label' ) || 'Pause';
		const nextLabel = isPaused ? playLabel : pauseLabel;

		button.setAttribute( 'aria-label', nextLabel );
		button.setAttribute( 'data-state', isPaused ? 'paused' : 'playing' );

		if ( label ) {
			label.textContent = nextLabel;
		}
	}

	function pauseVideo( root, video, reset ) {
		video.pause();

		if ( reset ) {
			try {
				video.currentTime = 0;
			} catch ( error ) {
				// A media stream without seekable metadata cannot be reset.
			}
		}

		root.classList.add( 'is-paused' );
		setButtonState( root, true );
	}

	function playVideo( root, video ) {
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
			'.wp-block-ran-enhanced-cover'
		);

		if ( persist ) {
			setStoredPausePreference( isPaused );
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

	function toggleBanner( event ) {
		const button = event.currentTarget;
		const root = button.closest( '.wp-block-ran-enhanced-cover' );

		if ( ! root ) {
			return;
		}

		setSiteMotionState( ! root.classList.contains( 'is-paused' ), true );
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

		const button = root.querySelector( '.ran-video-cover__toggle' );

		if ( isPaused ) {
			pauseVideo( root, video, true );
		} else {
			playVideo( root, video );
		}

		if ( button ) {
			button.addEventListener( 'click', toggleBanner );
		}
	}

	function init() {
		const mediaQuery =
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const prefersReducedMotion = !! ( mediaQuery && mediaQuery.matches );
		const isPaused = prefersReducedMotion || getStoredPausePreference();
		const banners = document.querySelectorAll(
			'.wp-block-ran-enhanced-cover'
		);

		for ( let index = 0; index < banners.length; index++ ) {
			initBanner( banners[ index ], isPaused );
		}

		window.addEventListener( 'storage', function ( event ) {
			if ( STORAGE_KEY !== event.key ) {
				return;
			}

			setSiteMotionState( getStoredPausePreference(), false );
		} );
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
