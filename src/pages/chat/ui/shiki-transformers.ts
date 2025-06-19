import { type ShikiTransformer } from 'shiki';
import { css } from 'styled-system/css';

const buttonClassName = css({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	position: 'absolute',
	top: '0.5rem',
	right: '0.5rem',
	size: '2rem',
	background: 'gray.4',
	borderRadius: 'l1',
	border: 'default',
	cursor: 'pointer',
	_hover: {
		background: 'gray.1',
	},
	transition: '100ms all',
	opacity: '0',
	_groupHover: { opacity: '1' },
});

const iconClassName = css.raw({
	width: '1.25rem',
	height: '1.25rem',
	transition: '200ms opacity',
});

const clipboardSvg = btoa(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-icon lucide-clipboard">
		<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
		<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
	</svg>
`);

const copyiedSvg = btoa(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check">
		<path d="M20 6 9 17l-5-5"/>
	</svg>
`);

export const transformerAddCopyButton: ShikiTransformer = ({
	name: 'add-copy-button',
	pre(node) {
		this.addClassToHast(node, 'group');

		node.children.push({
			type: 'element',
			tagName: 'button',
			properties: {
				'class': buttonClassName,
				'data-code': this.source,
				'onclick': `
					navigator.clipboard.writeText(this.dataset.code);
					this.classList.add('copied');
					setTimeout(() => this.classList.remove('copied'), 3000)
				`,
			},
			children: [
				{
					type: 'element',
					tagName: 'span',
					properties: {
						class: css(iconClassName, {
							'opacity': 1.0,
							'.copied &': { opacity: 0.0 },
						}),
						style: `background-image: url('data:image/svg+xml;base64,${clipboardSvg}')`,
					},
					children: [],
				},
				{
					type: 'element',
					tagName: 'span',
					properties: {
						class: css(iconClassName, {
							'position': 'absolute',
							'opacity': 0.0,
							'.copied &': { opacity: 1.0 },
						}),
						style: `background-image: url('data:image/svg+xml;base64,${copyiedSvg}')`,
					},
					children: [],
				},
			],
		});
	},
});
