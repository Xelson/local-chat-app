import type { HTMLStyledProps } from 'styled-system/types';
import logoImage from './logo.webp';
import { styled } from 'styled-system/jsx';

export function Logo(props: HTMLStyledProps<'img'>) {
	return (
		<styled.img
			size='5rem'
			rounded='full'
			userSelect='none'
			draggable='false'
			{...props}
			src={logoImage}
		/>
	);
}
