/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	FormFileUpload,
	IconButton,
	Placeholder,
	Toolbar,
} from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import editorMediaUpload from '../../editor-media-upload';
import MediaUpload from '../../media-upload';
import RichText from '../../rich-text';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';

export const name = 'core/video';

export const settings = {
	title: __( 'Video' ),

	description: __( 'The Video block allows you to embed video files and play them back using a simple player.' ),

	icon: 'format-video',

	category: 'common',

	attributes: {
		align: {
			type: 'string',
		},
		id: {
			type: 'number',
		},
		src: {
			type: 'string',
			source: 'attribute',
			selector: 'video',
			attribute: 'src',
		},
		caption: {
			type: 'array',
			source: 'children',
			selector: 'figcaption',
		},
	},

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'center' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit: class extends Component {
		constructor() {
			super( ...arguments );
			// edit component has its own src in the state so it can be edited
			// without setting the actual value outside of the edit UI
			this.state = {
				editing: ! this.props.attributes.src,
				src: this.props.attributes.src,
			};
		}

		render() {
			const { align, caption, id } = this.props.attributes;
			const { setAttributes, isSelected, className } = this.props;
			const { editing, src } = this.state;
			const updateAlignment = ( nextAlign ) => setAttributes( { align: nextAlign } );
			const switchToEditing = () => {
				this.setState( { editing: true } );
			};
			const onSelectVideo = ( media ) => {
				if ( media && media.url ) {
					// sets the block's attribute and updates the edit component from the
					// selected media, then switches off the editing UI
					setAttributes( { src: media.url, id: media.id } );
					this.setState( { src: media.url, editing: false } );
				}
			};
			const onSelectUrl = ( event ) => {
				event.preventDefault();
				if ( src ) {
					// set the block's src from the edit component's state, and switch off the editing UI
					setAttributes( { src } );
					this.setState( { editing: false } );
				}
				return false;
			};
			const setVideo = ( [ audio ] ) => onSelectVideo( audio );
			const uploadFromFiles = ( event ) => editorMediaUpload( event.target.files, setVideo, 'video' );
			const controls = (
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ updateAlignment }
					/>
					{ ! editing && (
						<Toolbar>
							<IconButton
								className="components-icon-button components-toolbar__control"
								label={ __( 'Edit video' ) }
								onClick={ switchToEditing }
								icon="edit"
							/>
						</Toolbar>
					) }
				</BlockControls>
			);

			if ( editing ) {
				return (
					<Fragment>
						{ controls }
						<Placeholder
							icon="media-video"
							label={ __( 'Video' ) }
							instructions={ __( 'Select a video file from your library, or upload a new one' ) }
							className={ className }>
							<form onSubmit={ onSelectUrl }>
								<input
									type="url"
									className="components-placeholder__input"
									placeholder={ __( 'Enter URL of video file here…' ) }
									onChange={ ( event ) => this.setState( { src: event.target.value } ) }
									value={ src || '' } />
								<Button
									isLarge
									type="submit">
									{ __( 'Use URL' ) }
								</Button>
							</form>
							<FormFileUpload
								isLarge
								className="wp-block-video__upload-button"
								onChange={ uploadFromFiles }
								accept="video/*"
							>
								{ __( 'Upload' ) }
							</FormFileUpload>
							<MediaUpload
								onSelect={ onSelectVideo }
								type="video"
								id={ id }
								render={ ( { open } ) => (
									<Button isLarge onClick={ open } >
										{ __( 'Media Library' ) }
									</Button>
								) }
							/>
						</Placeholder>
					</Fragment>
				);
			}

			/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
			return (
				<Fragment>
					{ controls }
					<figure className={ className }>
						<video controls src={ src } />
						{ ( ( caption && caption.length ) || isSelected ) && (
							<RichText
								tagName="figcaption"
								placeholder={ __( 'Write caption…' ) }
								value={ caption }
								onChange={ ( value ) => setAttributes( { caption: value } ) }
								inlineToolbar
							/>
						) }
					</figure>
				</Fragment>
			);
			/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		}
	},

	save( { attributes } ) {
		const { src, caption, align } = attributes;
		return (

			<figure className={ align ? `align${ align }` : null }>
				{ src && <video controls src={ src } /> }
				{ caption && caption.length > 0 && <figcaption>{ caption }</figcaption> }
			</figure>
		);
	},
};
