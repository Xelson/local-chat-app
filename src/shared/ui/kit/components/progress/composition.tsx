import { forwardRef } from 'react';
import * as StyledProgress from './parts';

export interface ProgressProps extends StyledProgress.RootProps {
	/**
   * The type of progress to render.
   * @default linear
   */
	type?: 'linear' | 'circular';

	showValueText?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) => {
	const { children, type = 'linear', showValueText = false, ...rootProps } = props;

	return (
		<StyledProgress.Root ref={ref} {...rootProps}>
			{children && <StyledProgress.Label>{children}</StyledProgress.Label>}
			{type === 'linear' && (
				<StyledProgress.Track>
					<StyledProgress.Range />
				</StyledProgress.Track>
			)}
			{type === 'circular' && (
				<StyledProgress.Circle>
					<StyledProgress.CircleTrack />
					<StyledProgress.CircleRange />
					<StyledProgress.ValueText />
				</StyledProgress.Circle>
			)}
			{showValueText && <StyledProgress.ValueText />}
		</StyledProgress.Root>
	);
});

Progress.displayName = 'Progress';
