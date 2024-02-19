import {scale} from '@remotion/animation-utils';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const ZoomInEffect: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: 10,
	});

	return (
		<AbsoluteFill
			style={{
				transform: scale(interpolate(progress, [0, 1], [3, 1])),
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
