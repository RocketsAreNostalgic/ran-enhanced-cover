import {
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	PanelColorSettings,
	useBlockProps,
	useSettings,
	__experimentalUnitControl as BlockEditorUnitControl,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import {
	BaseControl,
	Button,
	FocalPointPicker,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as ComponentsUnitControl,
} from '@wordpress/components';
import { createElement as el, useRef, useState } from '@wordpress/element';
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
	const style = {
		'--ran-video-cover-min-height': minHeight + minHeightUnit,
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
	const blockProps = useBlockProps( {
		className: wrapperClassName( attributes ),
		style: wrapperStyle( attributes, spacingSizes ),
	} );
	const hasMedia = !! ( attributes.videoUrl || attributes.posterUrl );
	const showGenericPreview = ! hasMedia && ! props.isSelected;

	function setVideo( media ) {
		setAttributes( {
			videoId: media && media.id ? media.id : 0,
			videoUrl: media && media.url ? media.url : '',
		} );
	}

	function setPoster( media ) {
		setAttributes( {
			posterId: media && media.id ? media.id : 0,
			posterUrl: media && media.url ? media.url : '',
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
			InspectorControls,
			null,
			el(
				PanelBody,
				{ title: __( 'Media', 'ran-video-cover' ), initialOpen: true },
				el( MediaSelector, {
					allowedTypes: [ 'video' ],
					buttonLabel: attributes.videoUrl
						? __( 'Replace', 'ran-video-cover' )
						: __( 'Select', 'ran-video-cover' ),
					clearLabel: __( 'Clear', 'ran-video-cover' ),
					label: __( 'Video', 'ran-video-cover' ),
					onClear() {
						setVideo( null );
					},
					onSelect: setVideo,
					url: attributes.videoUrl,
					value: attributes.videoId,
				} ),
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
				attributes.posterUrl &&
					el( FocalPointPicker, {
						label: __( 'Focal point', 'ran-video-cover' ),
						url: attributes.posterUrl,
						value: focalPoint( attributes ),
						onChange( value ) {
							setAttributes( { focalPoint: value } );
						},
					} )
			),
			el(
				PanelBody,
				{
					title: __( 'Layout', 'ran-video-cover' ),
					initialOpen: false,
				},
				el( RangeControl, {
					label: __( 'Minimum height', 'ran-video-cover' ),
					value: attributes.minHeight,
					onChange( value ) {
						setAttributes( { minHeight: value || 0 } );
					},
					min: 20,
					max: 100,
				} ),
				el( SelectControl, {
					label: __( 'Minimum height unit', 'ran-video-cover' ),
					value: attributes.minHeightUnit,
					options: [
						{ label: 'vh', value: 'vh' },
						{ label: '%', value: '%' },
						{ label: 'px', value: 'px' },
						{ label: 'rem', value: 'rem' },
					],
					onChange( value ) {
						setAttributes( { minHeightUnit: value } );
					},
				} ),
				el( SelectControl, {
					label: __( 'Content position', 'ran-video-cover' ),
					value: attributes.contentPosition,
					options: [
						{
							label: __( 'Top left', 'ran-video-cover' ),
							value: 'top left',
						},
						{
							label: __( 'Top center', 'ran-video-cover' ),
							value: 'top center',
						},
						{
							label: __( 'Top right', 'ran-video-cover' ),
							value: 'top right',
						},
						{
							label: __( 'Center left', 'ran-video-cover' ),
							value: 'center left',
						},
						{
							label: __( 'Center', 'ran-video-cover' ),
							value: 'center center',
						},
						{
							label: __( 'Center right', 'ran-video-cover' ),
							value: 'center right',
						},
						{
							label: __( 'Bottom left', 'ran-video-cover' ),
							value: 'bottom left',
						},
						{
							label: __( 'Bottom center', 'ran-video-cover' ),
							value: 'bottom center',
						},
						{
							label: __( 'Bottom right', 'ran-video-cover' ),
							value: 'bottom right',
						},
					],
					onChange( value ) {
						setAttributes( { contentPosition: value } );
					},
				} )
			),
			el( PanelColorSettings, {
				title: __( 'Background colour', 'ran-video-cover' ),
				initialOpen: false,
				colorSettings: [
					{
						value: selectedColor(
							colors,
							attributes.backgroundColor,
							attributes.customBackgroundColor
						),
						onChange: setBackgroundColor,
						label: __( 'Background colour', 'ran-video-cover' ),
					},
				],
			} ),
			el(
				PanelColorSettings,
				{
					title: __( 'Colour wash', 'ran-video-cover' ),
					initialOpen: false,
					colorSettings: [
						{
							value: selectedColor(
								colors,
								attributes.overlayColor,
								attributes.customOverlayColor
							),
							onChange: setOverlayColor,
							label: __( 'Wash colour', 'ran-video-cover' ),
						},
					],
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
				el( InsetControl, {
					attribute: 'pauseControlInsetBlock',
					label: __( 'Block-axis inset', 'ran-video-cover' ),
					setAttributes,
					spacingSizes,
					value: attributes.pauseControlInsetBlock,
				} ),
				el( InsetControl, {
					attribute: 'pauseControlInsetInline',
					label: __( 'Inline-axis inset', 'ran-video-cover' ),
					setAttributes,
					spacingSizes,
					value: attributes.pauseControlInsetInline,
				} )
			)
		),
		attributes.videoUrl &&
			el( 'video', {
				className: 'ran-video-cover__media',
				autoPlay: false,
				muted: true,
				loop: true,
				playsInline: true,
				ref: videoRef,
				src: attributes.videoUrl,
				poster: attributes.posterUrl,
				style: mediaPositionStyle( attributes ),
			} ),
		! attributes.videoUrl &&
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
			attributes.videoUrl &&
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
