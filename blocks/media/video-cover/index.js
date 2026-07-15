import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	MediaReplaceFlow,
	store as blockEditorStore,
	useBlockProps,
	useSettings,
	__experimentalBlockAlignmentMatrixControl as BlockAlignmentMatrixControl,
	__experimentalBlockFullHeightAligmentControl as BlockFullHeightAlignmentControl,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUnitControl as BlockEditorUnitControl,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import {
	BaseControl,
	Button,
	Dropdown,
	FocalPointPicker,
	PanelBody,
	RangeControl,
	SelectControl,
	ToolbarButton,
	ToggleControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalUnitControl as ComponentsUnitControl,
} from '@wordpress/components';
import { createElement as el, useRef, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import './editor.css';
import './style.css';

const ICON = el(
	'svg',
	{
		'aria-hidden': true,
		focusable: false,
		viewBox: '0 0 24 24',
		xmlns: 'http://www.w3.org/2000/svg',
	},
	el( 'path', {
		d: 'M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2 0v13c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5Zm4 9.75v-6.5L14.25 12 9 15.25ZM15 9h2v1.5h-2V9Zm0 4.5h2V15h-2v-1.5ZM7 17h10v1.5H7V17Z',
		fill: 'currentColor',
	} )
);

const TEMPLATE = [
	[
		'core/heading',
		{
			level: 1,
			placeholder: __( 'Banner heading', 'ran-video-cover' ),
		},
	],
	[
		'core/paragraph',
		{
			placeholder: __( 'Optional hook text', 'ran-video-cover' ),
		},
	],
];

const CONTROL_POSITIONS = [
	'top left',
	'top center',
	'top right',
	'bottom left',
	'bottom center',
	'bottom right',
];

const UnitControl = BlockEditorUnitControl || ComponentsUnitControl;

const INSET_UNITS = [
	{ value: 'px', label: 'px', default: 16 },
	{ value: 'rem', label: 'rem', default: 1 },
	{ value: 'em', label: 'em', default: 1 },
	{ value: '%', label: '%', default: 5 },
	{ value: 'vw', label: 'vw', default: 5 },
	{ value: 'vh', label: 'vh', default: 5 },
];

const MIN_HEIGHT_UNITS = [
	{ value: 'px', label: 'px', default: 430 },
	{ value: '%', label: '%', default: 20 },
	{ value: 'em', label: 'em', default: 20 },
	{ value: 'rem', label: 'rem', default: 20 },
	{ value: 'vw', label: 'vw', default: 20 },
	{ value: 'vh', label: 'vh', default: 50 },
];

function positionClass( contentPosition ) {
	return (
		'is-position-' +
		String( contentPosition || 'center left' ).replace( /\s+/g, '-' )
	);
}

function overlayValue( attributes ) {
	if ( attributes.customOverlayColor ) {
		return attributes.customOverlayColor;
	}

	if ( attributes.overlayColor ) {
		return 'var(--wp--preset--color--' + attributes.overlayColor + ')';
	}

	return '#121212';
}

function backgroundValue( attributes ) {
	if ( attributes.customBackgroundColor ) {
		return attributes.customBackgroundColor;
	}

	if ( attributes.backgroundColor ) {
		return (
			'var(--wp--preset--color--' +
			attributes.backgroundColor +
			', transparent)'
		);
	}

	return 'transparent';
}

function controlPosition( value ) {
	return CONTROL_POSITIONS.includes( value ) ? value : 'bottom right';
}

function minHeightValue( attributes ) {
	const value = Number.isFinite( Number( attributes.minHeight ) )
		? attributes.minHeight
		: 80;
	const unit = MIN_HEIGHT_UNITS.some( function ( item ) {
		return item.value === attributes.minHeightUnit;
	} )
		? attributes.minHeightUnit
		: 'vh';

	return value + unit;
}

function minHeightParts( value ) {
	const match = String( value || '' )
		.trim()
		.match( /^([-+]?(?:\d+|\d*\.\d+))(px|%|em|rem|vw|vh)$/ );

	if ( ! match ) {
		return null;
	}

	return { value: Number( match[ 1 ] ), unit: match[ 2 ] };
}

function styleWithoutAspectRatio( style ) {
	if ( ! style || ! style.dimensions || ! style.dimensions.aspectRatio ) {
		return style;
	}

	const dimensions = { ...style.dimensions };
	delete dimensions.aspectRatio;

	return {
		...style,
		dimensions,
	};
}

function spacingPresetSlug( value ) {
	const presetToken = String( value || '' ).match(
		/^var:preset\|spacing\|([a-z0-9-]+)$/
	);

	if ( presetToken ) {
		return presetToken[ 1 ];
	}

	const match = String( value || '' ).match(
		/^var\(--wp--preset--spacing--([a-z0-9-]+)\)$/
	);

	return match ? match[ 1 ] : '';
}

function insetParts( value, spacingSizes ) {
	const preset = spacingPresetSlug( value );

	if ( preset ) {
		const matchingPreset = (
			Array.isArray( spacingSizes ) ? spacingSizes : []
		).find( function ( size ) {
			return size && size.slug === preset && size.size;
		} );

		if ( matchingPreset ) {
			return insetParts( matchingPreset.size );
		}
	}

	const match = String( value || '' ).match(
		/^([-+]?(?:\d+|\d*\.\d+))(px|rem|em|%|vw|vh)$/
	);

	if ( match ) {
		return { value: match[ 1 ], unit: match[ 2 ] };
	}

	if ( '0' === String( value ) ) {
		return { value: '0', unit: 'rem' };
	}

	return { value: '1', unit: 'rem' };
}

function insetValue( value, spacingSizes ) {
	const preset = spacingPresetSlug( value );

	if ( preset ) {
		const hasPreset = (
			Array.isArray( spacingSizes ) ? spacingSizes : []
		).some( function ( size ) {
			return size && size.slug === preset && size.size;
		} );

		return hasPreset
			? 'var(--wp--preset--spacing--' + preset + ')'
			: '1rem';
	}

	const parts = insetParts( value );

	return parts.value + parts.unit;
}

function insetRangeConfig( unit ) {
	if ( 'rem' === unit || 'em' === unit ) {
		return { max: 8, step: 0.1 };
	}

	if ( '%' === unit || 'vw' === unit || 'vh' === unit ) {
		return { max: 100, step: 1 };
	}

	return { max: 128, step: 1 };
}

function InsetControl( {
	attribute,
	label,
	setAttributes,
	spacingSizes,
	value,
} ) {
	const requestedPreset = spacingPresetSlug( value );
	const preset = ( Array.isArray( spacingSizes ) ? spacingSizes : [] ).some(
		function ( size ) {
			return size && size.slug === requestedPreset && size.size;
		}
	)
		? requestedPreset
		: '';
	const parts = insetParts( value, spacingSizes );
	const rangeConfig = insetRangeConfig( parts.unit );
	const presetOptions = [
		{
			label: __( 'Custom numeric value', 'ran-video-cover' ),
			value: '',
		},
	].concat(
		( Array.isArray( spacingSizes ) ? spacingSizes : [] )
			.filter( function ( size ) {
				return size && size.slug && size.name;
			} )
			.map( function ( size ) {
				return { label: size.name, value: size.slug };
			} )
	);

	return el(
		'div',
		{ className: 'ran-video-cover-inset-control' },
		el( 'p', { className: 'components-base-control__label' }, label ),
		el( SelectControl, {
			label: __( 'Spacing preset', 'ran-video-cover' ) + ': ' + label,
			value: preset,
			options: presetOptions,
			onChange( slug ) {
				setAttributes( {
					[ attribute ]: slug
						? 'var:preset|spacing|' + slug
						: parts.value + parts.unit,
				} );
			},
		} ),
		! preset &&
			el(
				'div',
				{ className: 'ran-video-cover-inset-control__inputs' },
				el( UnitControl, {
					__next40pxDefaultSize: true,
					__unstableInputWidth: '88px',
					hideLabelFromVision: true,
					label,
					min: 0,
					units: INSET_UNITS,
					value: parts.value + parts.unit,
					onChange( nextValue ) {
						setAttributes( {
							[ attribute ]: nextValue || '',
						} );
					},
				} ),
				el( RangeControl, {
					__next40pxDefaultSize: true,
					hideLabelFromVision: true,
					label,
					max: rangeConfig.max,
					min: 0,
					step: rangeConfig.step,
					value: Number( parts.value ),
					withInputField: false,
					onChange( nextValue ) {
						setAttributes( {
							[ attribute ]:
								nextValue === undefined
									? ''
									: nextValue + parts.unit,
						} );
					},
				} )
			)
	);
}

function focalPoint( attributes ) {
	return attributes.focalPoint || { x: 0.5, y: 0.5 };
}

function mediaPositionStyle( attributes ) {
	const point = focalPoint( attributes );

	return {
		objectPosition: point.x * 100 + '% ' + point.y * 100 + '%',
	};
}

function wrapperStyle( attributes, spacingSizes ) {
	const point = focalPoint( attributes );
	const minHeight = attributes.minHeight || 80;
	const minHeightUnit = attributes.minHeightUnit || 'vh';
	const blockInset = insetValue(
		attributes.pauseControlInsetBlock,
		spacingSizes
	);
	const inlineInset = insetValue(
		attributes.pauseControlInsetInline,
		spacingSizes
	);
	const togglePosition = controlPosition( attributes.pauseControlPosition );
	const hasAspectRatio = !! (
		attributes.style &&
		attributes.style.dimensions &&
		attributes.style.dimensions.aspectRatio
	);
	const style = {
		'--ran-video-cover-min-height': hasAspectRatio
			? undefined
			: minHeight + minHeightUnit,
		'--ran-video-cover-focal-x': point.x * 100 + '%',
		'--ran-video-cover-focal-y': point.y * 100 + '%',
		'--ran-video-cover-background': backgroundValue( attributes ),
		'--ran-video-cover-wash': overlayValue( attributes ),
		'--ran-video-cover-wash-opacity':
			( attributes.overlayOpacity || 0 ) / 100,
		'--ran-video-cover-toggle-block-start': 'auto',
		'--ran-video-cover-toggle-block-end': 'auto',
		'--ran-video-cover-toggle-inline-start': 'auto',
		'--ran-video-cover-toggle-inline-end': 'auto',
		'--ran-video-cover-toggle-transform': 'none',
	};

	if ( togglePosition.indexOf( 'top' ) !== -1 ) {
		style[ '--ran-video-cover-toggle-block-start' ] = blockInset;
	} else {
		style[ '--ran-video-cover-toggle-block-end' ] = blockInset;
	}

	if ( togglePosition.indexOf( 'left' ) !== -1 ) {
		style[ '--ran-video-cover-toggle-inline-start' ] = inlineInset;
	} else if ( togglePosition.indexOf( 'center' ) !== -1 ) {
		style[ '--ran-video-cover-toggle-inline-start' ] = '50%';
		style[ '--ran-video-cover-toggle-transform' ] = 'translateX(-50%)';
	} else {
		style[ '--ran-video-cover-toggle-inline-end' ] = inlineInset;
	}

	return style;
}

function wrapperClassName( attributes ) {
	return [
		'ran-video-cover',
		'has-custom-content-position',
		positionClass( attributes.contentPosition ),
	].join( ' ' );
}

function matchingPaletteColor( palette, color ) {
	return palette.find( function ( paletteColor ) {
		return paletteColor.color === color;
	} );
}

function selectedColor( palette, colorSlug, customColor ) {
	if ( customColor ) {
		return customColor;
	}

	const match = palette.find( function ( paletteColor ) {
		return paletteColor.slug === colorSlug;
	} );

	return match ? match.color : '';
}

function fileNameFromUrl( url ) {
	if ( ! url ) {
		return '';
	}

	const path = String( url ).split( '?' )[ 0 ].split( '#' )[ 0 ];
	const fileName = path.split( '/' ).filter( Boolean ).pop();

	if ( ! fileName ) {
		return '';
	}

	try {
		return decodeURIComponent( fileName );
	} catch ( error ) {
		return fileName;
	}
}

function sourceFromMedia( media ) {
	return {
		id: media && media.id ? media.id : 0,
		url: media && media.url ? media.url : '',
	};
}

function normaliseVideoSource( source ) {
	if ( ! source || ! source.url ) {
		return null;
	}

	return {
		id: source.id || 0,
		url: source.url,
	};
}

function videoSources( attributes ) {
	const sources = Array.isArray( attributes.videoSources )
		? attributes.videoSources.map( normaliseVideoSource ).filter( Boolean )
		: [];

	if ( sources.length ) {
		return sources;
	}

	return attributes.videoUrl
		? [
				{
					id: attributes.videoId || 0,
					url: attributes.videoUrl,
				},
		  ]
		: [];
}

function VideoSourcesPanel( {
	onAdd,
	onClose,
	onMove,
	onRemove,
	onReplace,
	sources,
} ) {
	function openMediaLibrary( mediaUpload ) {
		onClose();

		window.requestAnimationFrame( function () {
			mediaUpload.open();
		} );
	}

	return el(
		'div',
		{ className: 'ran-video-cover-video-sources-popover' },
		el( 'h2', null, __( 'Video sources', 'ran-video-cover' ) ),
		el(
			'p',
			null,
			__(
				'Browsers try these files from top to bottom.',
				'ran-video-cover'
			)
		),
		sources.map( function ( source, index ) {
			return el(
				'div',
				{
					className: 'ran-video-cover-video-source',
					key: source.url + index,
				},
				el(
					'p',
					{ className: 'ran-video-cover-video-source__name' },
					fileNameFromUrl( source.url )
				),
				el(
					'div',
					{ className: 'ran-video-cover-video-source__actions' },
					el(
						'div',
						{
							className:
								'ran-video-cover-video-source__order-actions',
						},
						el( Button, {
							disabled: 0 === index,
							icon: 'arrow-up-alt2',
							label: __( 'Move up', 'ran-video-cover' ),
							onClick() {
								onMove( index, -1 );
							},
							showTooltip: true,
							size: 'compact',
							variant: 'tertiary',
						} ),
						el( Button, {
							disabled: index === sources.length - 1,
							icon: 'arrow-down-alt2',
							label: __( 'Move down', 'ran-video-cover' ),
							onClick() {
								onMove( index, 1 );
							},
							showTooltip: true,
							size: 'compact',
							variant: 'tertiary',
						} )
					),
					el(
						'div',
						{
							className:
								'ran-video-cover-video-source__file-actions',
						},
						el(
							MediaUploadCheck,
							null,
							el( MediaUpload, {
								allowedTypes: [ 'video' ],
								onSelect( media ) {
									onReplace( index, media );
									onClose();
								},
								value: source.id,
								render( mediaUpload ) {
									return el( Button, {
										icon: 'update',
										label: __(
											'Replace video',
											'ran-video-cover'
										),
										onClick() {
											openMediaLibrary( mediaUpload );
										},
										showTooltip: true,
										size: 'compact',
										variant: 'secondary',
									} );
								},
							} )
						),
						el( Button, {
							icon: 'trash',
							isDestructive: true,
							label: __( 'Remove video', 'ran-video-cover' ),
							onClick() {
								onRemove( index );
							},
							showTooltip: true,
							size: 'compact',
							variant: 'tertiary',
						} )
					)
				)
			);
		} ),
		el(
			MediaUploadCheck,
			null,
			el( MediaUpload, {
				allowedTypes: [ 'video' ],
				onSelect( media ) {
					onAdd( media );
					onClose();
				},
				render( mediaUpload ) {
					return el(
						Button,
						{
							className:
								'ran-video-cover-video-sources-popover__add',
							icon: 'plus-alt2',
							onClick() {
								openMediaLibrary( mediaUpload );
							},
							variant: 'primary',
						},
						__( 'Add sources', 'ran-video-cover' )
					);
				},
			} )
		)
	);
}

function MediaSelector( {
	allowedTypes,
	buttonLabel,
	clearLabel,
	label,
	onClear,
	onSelect,
	url,
	value,
} ) {
	return el(
		BaseControl,
		{ className: 'ran-video-cover-media-control', label },
		el(
			'div',
			{ className: 'ran-video-cover-media-control__body' },
			el(
				'div',
				{ className: 'ran-video-cover-media-control__filename' },
				url
					? fileNameFromUrl( url )
					: __( 'No file selected', 'ran-video-cover' )
			),
			el(
				'div',
				{ className: 'ran-video-cover-media-control__actions' },
				el(
					MediaUploadCheck,
					null,
					el( MediaUpload, {
						allowedTypes,
						onSelect,
						value,
						render( mediaUpload ) {
							return el(
								Button,
								{
									variant: 'secondary',
									onClick: mediaUpload.open,
								},
								buttonLabel
							);
						},
					} )
				),
				url &&
					el(
						Button,
						{
							isDestructive: true,
							onClick: onClear,
							variant: 'tertiary',
						},
						clearLabel
					)
			)
		)
	);
}

function VideoBannerEdit( props ) {
	const attributes = props.attributes;
	const setAttributes = props.setAttributes;
	const videoRef = useRef();
	const editorPausedState = useState( true );
	const isEditorPaused = editorPausedState[ 0 ];
	const setIsEditorPaused = editorPausedState[ 1 ];
	const settings = useSettings( 'color.palette' );
	const colors = settings[ 0 ] || [];
	const spacingSettings = useSettings( 'spacing.spacingSizes' );
	const spacingSizes = spacingSettings[ 0 ] || [];
	const previousHeightState = useState( {
		value: attributes.minHeight,
		unit: attributes.minHeightUnit,
	} );
	const previousHeight = previousHeightState[ 0 ];
	const setPreviousHeight = previousHeightState[ 1 ];
	const hasInnerBlocks = useSelect(
		function ( select ) {
			const block = select( blockEditorStore ).getBlock( props.clientId );

			return !! ( block && block.innerBlocks.length );
		},
		[ props.clientId ]
	);
	const blockProps = useBlockProps( {
		className: wrapperClassName( attributes ),
		style: wrapperStyle( attributes, spacingSizes ),
	} );
	const sources = videoSources( attributes );
	const primaryVideo = sources[ 0 ] || null;
	const hasVideo = !! primaryVideo;
	const hasMedia = !! ( hasVideo || attributes.posterUrl );
	const showGenericPreview = ! hasMedia && ! props.isSelected;

	function setVideoSources( nextSources ) {
		const firstSource = nextSources[ 0 ] || null;

		setAttributes( {
			videoId: firstSource ? firstSource.id : 0,
			videoSources: nextSources,
			videoUrl: firstSource ? firstSource.url : '',
		} );
	}

	function setVideo( media ) {
		setVideoSources( media ? [ sourceFromMedia( media ) ] : [] );
	}

	function addVideoSource( media ) {
		if ( media ) {
			setVideoSources( sources.concat( sourceFromMedia( media ) ) );
		}
	}

	function replaceVideoSource( index, media ) {
		if ( ! media ) {
			return;
		}

		const nextSources = sources.slice();
		nextSources[ index ] = sourceFromMedia( media );
		setVideoSources( nextSources );
	}

	function removeVideoSource( index ) {
		setVideoSources(
			sources.filter( function ( source, sourceIndex ) {
				return sourceIndex !== index;
			} )
		);
	}

	function moveVideoSource( index, direction ) {
		const nextIndex = index + direction;

		if ( nextIndex < 0 || nextIndex >= sources.length ) {
			return;
		}

		const nextSources = sources.slice();
		const current = nextSources[ index ];
		nextSources[ index ] = nextSources[ nextIndex ];
		nextSources[ nextIndex ] = current;
		setVideoSources( nextSources );
	}

	function setPoster( media ) {
		setAttributes( {
			posterId: media && media.id ? media.id : 0,
			posterUrl: media && media.url ? media.url : '',
		} );
	}

	function setMinimumHeight( value ) {
		const parts = minHeightParts( value );

		if ( ! parts ) {
			return;
		}

		setAttributes( {
			minHeight: parts.value,
			minHeightUnit: parts.unit,
			style: styleWithoutAspectRatio( attributes.style ),
		} );
	}

	function toggleFullHeight() {
		const isFullHeight =
			'vh' === attributes.minHeightUnit &&
			100 === attributes.minHeight &&
			! (
				attributes.style &&
				attributes.style.dimensions &&
				attributes.style.dimensions.aspectRatio
			);

		if ( isFullHeight ) {
			setAttributes( {
				minHeight: previousHeight.value || 80,
				minHeightUnit: previousHeight.unit || 'vh',
			} );
			return;
		}

		setPreviousHeight( {
			value: attributes.minHeight,
			unit: attributes.minHeightUnit,
		} );
		setAttributes( {
			minHeight: 100,
			minHeightUnit: 'vh',
			style: styleWithoutAspectRatio( attributes.style ),
		} );
	}

	function setOverlayColor( color ) {
		const match = matchingPaletteColor( colors, color );

		if ( match ) {
			setAttributes( {
				overlayColor: match.slug,
				customOverlayColor: '',
			} );
			return;
		}

		setAttributes( {
			overlayColor: '',
			customOverlayColor: color || '',
		} );
	}

	function setBackgroundColor( color ) {
		const match = matchingPaletteColor( colors, color );

		if ( match ) {
			setAttributes( {
				backgroundColor: match.slug,
				customBackgroundColor: '',
			} );
			return;
		}

		setAttributes( {
			backgroundColor: '',
			customBackgroundColor: color || '',
		} );
	}

	function toggleEditorVideo( event ) {
		event.preventDefault();
		event.stopPropagation();

		const video = videoRef.current;

		if ( ! video ) {
			return;
		}

		if ( isEditorPaused ) {
			const playAttempt = video.play();

			setIsEditorPaused( false );

			if ( playAttempt && playAttempt.catch ) {
				playAttempt.catch( function () {
					setIsEditorPaused( true );
				} );
			}
		} else {
			video.pause();
			setIsEditorPaused( true );
		}
	}

	return el(
		'section',
		blockProps,
		el(
			BlockControls,
			{ group: 'block' },
			el( BlockAlignmentMatrixControl, {
				label: __( 'Change content position', 'ran-video-cover' ),
				value: attributes.contentPosition,
				onChange( value ) {
					setAttributes( { contentPosition: value } );
				},
				isDisabled: ! hasInnerBlocks,
			} ),
			el( BlockFullHeightAlignmentControl, {
				isActive:
					'vh' === attributes.minHeightUnit &&
					100 === attributes.minHeight &&
					! (
						attributes.style &&
						attributes.style.dimensions &&
						attributes.style.dimensions.aspectRatio
					),
				onToggle: toggleFullHeight,
				isDisabled: ! hasInnerBlocks,
			} )
		),
		el(
			BlockControls,
			{ group: 'other' },
			el( MediaReplaceFlow, {
				allowedTypes: [ 'video' ],
				mediaId: primaryVideo ? primaryVideo.id : 0,
				mediaURL: primaryVideo ? primaryVideo.url : '',
				name: hasVideo
					? __( 'Replace video', 'ran-video-cover' )
					: __( 'Add video', 'ran-video-cover' ),
				onReset() {
					setVideo( null );
				},
				onSelect: setVideo,
				variant: 'toolbar',
			} ),
			hasVideo &&
				el( Dropdown, {
					renderToggle( { onToggle } ) {
						return el( ToolbarButton, {
							icon: 'format-video',
							label: __( 'Video sources', 'ran-video-cover' ),
							onClick: onToggle,
						} );
					},
					renderContent( { onClose } ) {
						return el( VideoSourcesPanel, {
							onAdd: addVideoSource,
							onClose,
							onMove: moveVideoSource,
							onRemove: removeVideoSource,
							onReplace: replaceVideoSource,
							sources,
						} );
					},
				} )
		),
		el(
			InspectorControls,
			{ group: 'settings' },
			el(
				PanelBody,
				{ title: __( 'Media', 'ran-video-cover' ), initialOpen: true },
				el( MediaSelector, {
					allowedTypes: [ 'image' ],
					buttonLabel: attributes.posterUrl
						? __( 'Replace', 'ran-video-cover' )
						: __( 'Select', 'ran-video-cover' ),
					clearLabel: __( 'Clear', 'ran-video-cover' ),
					label: __( 'Poster image', 'ran-video-cover' ),
					onClear() {
						setPoster( null );
					},
					onSelect: setPoster,
					url: attributes.posterUrl,
					value: attributes.posterId,
				} ),
				hasMedia &&
					el( FocalPointPicker, {
						label: __( 'Focal point', 'ran-video-cover' ),
						url:
							attributes.posterUrl ||
							( primaryVideo && primaryVideo.url ),
						value: focalPoint( attributes ),
						onChange( value ) {
							setAttributes( { focalPoint: value } );
						},
					} )
			),
			el(
				PanelBody,
				{
					title: __( 'Pause/play control', 'ran-video-cover' ),
					initialOpen: false,
				},
				el( ToggleControl, {
					label: __( 'Show pause/play control', 'ran-video-cover' ),
					checked: attributes.pauseControl,
					onChange( value ) {
						setAttributes( { pauseControl: value } );
					},
				} ),
				attributes.pauseControl &&
					el( SelectControl, {
						label: __( 'Control position', 'ran-video-cover' ),
						value: attributes.pauseControlPosition,
						options: [
							{
								label: __( 'Bottom right', 'ran-video-cover' ),
								value: 'bottom right',
							},
							{
								label: __( 'Bottom left', 'ran-video-cover' ),
								value: 'bottom left',
							},
							{
								label: __( 'Top right', 'ran-video-cover' ),
								value: 'top right',
							},
							{
								label: __( 'Top left', 'ran-video-cover' ),
								value: 'top left',
							},
							{
								label: __( 'Bottom center', 'ran-video-cover' ),
								value: 'bottom center',
							},
							{
								label: __( 'Top center', 'ran-video-cover' ),
								value: 'top center',
							},
						],
						onChange( value ) {
							setAttributes( { pauseControlPosition: value } );
						},
					} ),
				attributes.pauseControl &&
					el( InsetControl, {
						attribute: 'pauseControlInsetBlock',
						label: __( 'Block-axis inset', 'ran-video-cover' ),
						setAttributes,
						spacingSizes,
						value: attributes.pauseControlInsetBlock,
					} ),
				attributes.pauseControl &&
					el( InsetControl, {
						attribute: 'pauseControlInsetInline',
						label: __( 'Inline-axis inset', 'ran-video-cover' ),
						setAttributes,
						spacingSizes,
						value: attributes.pauseControlInsetInline,
					} )
			)
		),
		el(
			InspectorControls,
			{ group: 'dimensions' },
			el(
				ToolsPanelItem,
				{
					className: 'single-column',
					hasValue() {
						return (
							80 !== attributes.minHeight ||
							'vh' !== attributes.minHeightUnit
						);
					},
					label: __( 'Minimum height', 'ran-video-cover' ),
					onDeselect() {
						setAttributes( {
							minHeight: undefined,
							minHeightUnit: undefined,
						} );
					},
					resetAllFilter() {
						return {
							minHeight: undefined,
							minHeightUnit: undefined,
						};
					},
					isShownByDefault: true,
					panelId: props.clientId,
				},
				el( UnitControl, {
					__next40pxDefaultSize: true,
					label: __( 'Minimum height', 'ran-video-cover' ),
					min: 0,
					units: MIN_HEIGHT_UNITS,
					value: minHeightValue( attributes ),
					onChange: setMinimumHeight,
				} )
			)
		),
		el(
			InspectorControls,
			{ group: 'color' },
			el( ColorGradientSettingsDropdown, {
				__experimentalIsRenderedInSidebar: true,
				colors,
				gradients: [],
				disableCustomGradients: true,
				panelId: props.clientId,
				settings: [
					{
						colorValue: selectedColor(
							colors,
							attributes.backgroundColor,
							attributes.customBackgroundColor
						),
						onColorChange: setBackgroundColor,
						label: __( 'Background colour', 'ran-video-cover' ),
						isShownByDefault: true,
						resetAllFilter() {
							return {
								backgroundColor: undefined,
								customBackgroundColor: undefined,
							};
						},
						clearable: true,
					},
					{
						colorValue: selectedColor(
							colors,
							attributes.overlayColor,
							attributes.customOverlayColor
						),
						onColorChange: setOverlayColor,
						label: __( 'Colour wash', 'ran-video-cover' ),
						isShownByDefault: true,
						resetAllFilter() {
							return {
								overlayColor: undefined,
								customOverlayColor: undefined,
							};
						},
						clearable: true,
					},
				],
			} ),
			el(
				ToolsPanelItem,
				{
					className: 'single-column',
					hasValue() {
						return 70 !== attributes.overlayOpacity;
					},
					label: __( 'Wash opacity', 'ran-video-cover' ),
					onDeselect() {
						setAttributes( { overlayOpacity: 70 } );
					},
					resetAllFilter() {
						return { overlayOpacity: 70 };
					},
					isShownByDefault: true,
					panelId: props.clientId,
				},
				el( RangeControl, {
					label: __( 'Wash opacity', 'ran-video-cover' ),
					value: attributes.overlayOpacity,
					onChange( value ) {
						setAttributes( { overlayOpacity: value || 0 } );
					},
					min: 0,
					max: 100,
				} )
			)
		),
		hasVideo &&
			el(
				'video',
				{
					className: 'ran-video-cover__media',
					autoPlay: false,
					muted: true,
					loop: true,
					playsInline: true,
					ref: videoRef,
					poster: attributes.posterUrl,
					style: mediaPositionStyle( attributes ),
				},
				sources.map( function ( source, index ) {
					return el( 'source', {
						key: source.url + index,
						src: source.url,
					} );
				} )
			),
		! hasVideo &&
			attributes.posterUrl &&
			el( 'img', {
				className: 'ran-video-cover__media',
				src: attributes.posterUrl,
				alt: '',
				style: mediaPositionStyle( attributes ),
			} ),
		! hasMedia &&
			el(
				'div',
				{
					className: showGenericPreview
						? 'ran-video-cover__placeholder is-preview'
						: 'ran-video-cover__placeholder',
				},
				showGenericPreview
					? el( 'span', { 'aria-hidden': true } )
					: __(
							'Select a video and poster image.',
							'ran-video-cover'
					  )
			),
		el( 'span', {
			className: 'ran-video-cover__wash',
			'aria-hidden': true,
		} ),
		el(
			'div',
			{ className: 'ran-video-cover__content' },
			el( InnerBlocks, { template: TEMPLATE } )
		),
		attributes.pauseControl &&
			hasVideo &&
			el(
				'button',
				{
					className: 'ran-video-cover__toggle',
					type: 'button',
					'aria-pressed': isEditorPaused ? 'true' : 'false',
					onClick: toggleEditorVideo,
				},
				isEditorPaused
					? __( 'Play animation', 'ran-video-cover' )
					: __( 'Pause animation', 'ran-video-cover' )
			)
	);
}

registerBlockType( 'ran/video-cover', {
	edit: VideoBannerEdit,
	icon: ICON,

	save() {
		return el( InnerBlocks.Content );
	},
} );
