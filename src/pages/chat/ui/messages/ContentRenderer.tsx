import { reatomComponent } from '@reatom/react';
import { useMemo } from 'react';
import { styled } from 'styled-system/jsx';
import { Skeleton } from '~/shared/ui/kit/components';
import { type ContentRendererInputAtom, type ContentRendererModel, reatomContentRenderer } from '../../model/content-renderer';
import { css } from 'styled-system/css';

const proseStyle = css.raw({
	'position': 'relative',
	'maxWidth': 'full',

	'& pre.shiki': {
		padding: '1rem',
		borderRadius: 'l2',
		marginY: '0.5rem',
		maxWidth: 'full',
		overflowX: 'auto',
		minWidth: '3rem',
		minHeight: '3rem',
		position: 'relative',
	},
	'& img': {
		maxWidth: '10rem',
	},
	'& a': {
		color: 'colorPalette.9',
		textDecoration: 'underline',
	},
	'& h1': {
		textStyle: '6xl',
	},
	'& h2': {
		textStyle: '5xl',
	},
	'& h3': {
		textStyle: '4xl',
	},
	'& h4': {
		textStyle: '3xl',
	},
	'& h5': {
		textStyle: '2xl',
	},
	'& h6': {
		textStyle: 'xl',
	},
	'& blockquote': {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem',
		whiteSpace: 'break-spaces',
		background: 'white.a8',
		padding: '0.5rem',
		paddingLeft: '1rem',
		borderLeft: '0.25rem solid {colors.gray.7}',
		borderRadius: 'l1',
		marginY: '0.5rem',
	},
	'& ul': {
		listStyleType: 'disc',
		paddingStart: '1.5rem',
	},
	'& ol': {
		listStyleType: 'decimal',
		paddingStart: '1.5rem',
	},
	'& li': {
		marginY: '0.5rem',
	},
	'& table': {
		border: 'default',
	},
	'& th': {
		border: 'default',
		padding: '0.5rem',
		background: 'white.a6',
	},
	'& td': {
		border: 'default',
		padding: '0.5rem',
	},
});

const contentRenderersCache = new WeakMap<ContentRendererInputAtom, ContentRendererModel>();

const useCachedContentRenderer = (input: ContentRendererInputAtom) => {
	return useMemo(() => {
		let renderer = contentRenderersCache.get(input);
		if (!renderer) {
			renderer = reatomContentRenderer(input, '_contentRenderer');
			contentRenderersCache.set(input, renderer);
		}
		return renderer;
	}, [input]);
};

const stableRandomByString = (input: string, from = 0, to = 1) =>
	from + (input.split('').map(c => c.charCodeAt(0)).reduce((acc, val) => acc + val, 0)) % to;

export const ContentRenderer = reatomComponent(({ id, model }: { id: string; model: ContentRendererInputAtom }) => {
	const renderer = useCachedContentRenderer(model);
	const html = renderer();
	const rawText = model()?.toString();

	if (!html && rawText !== '') {
		return (
			<styled.div>
				<styled.span visibility='hidden'>
					{rawText ?? '? '.repeat(stableRandomByString(id, 8, 60))}
				</styled.span>

				<styled.div
					position='absolute'
					inset='0'
					bg='colorPalette.4'
				/>

				<Skeleton
					loading
					bg='colorPalette.6'
					position='absolute'
					inset='0'
					borderRadius='none'
				/>
			</styled.div>
		);
	}

	return (
		<styled.div
			className='group'
			dangerouslySetInnerHTML={{ __html: html as TrustedHTML }}
			css={proseStyle}
		/>
	);
});
