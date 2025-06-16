'use client';
import type { Assign, HTMLArkProps } from '@ark-ui/react';
import { ark } from '@ark-ui/react/factory';
import { forwardRef, useState } from 'react';
import { styled } from 'styled-system/jsx';
import { type SkeletonVariantProps, skeleton } from 'styled-system/recipes';
import type { JsxStyleProps } from 'styled-system/types';

const StyledSkeleton = styled(ark.div, skeleton);
const StyledWrapper = styled(ark.div);

export interface SkeletonProps
	extends Assign<JsxStyleProps, HTMLArkProps<'div'>>,
	SkeletonVariantProps {
	/**
	 *
	 * @default true
	 */
	loading?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
	const { loading = true, ...otherProps } = props;
	const [defaultLoading] = useState(loading);

	if (!loading) {
		return (
			<StyledWrapper
				animation={defaultLoading ? 'fade-in' : undefined}
				ref={ref}
				{...otherProps}
			/>
		);
	}

	return <StyledSkeleton ref={ref} {...otherProps} />;
});

Skeleton.displayName = 'Skeleton';
