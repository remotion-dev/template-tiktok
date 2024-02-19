import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {TheBoldFont} from '../load-font';

export const Word: React.FC<{
	enterProgress: number;
	text: string;
	stroke: boolean;
}> = ({enterProgress, text, stroke}) => {
	const scale = interpolate(enterProgress, [0, 1], [0.8, 1]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'flex-end',
				alignItems: 'center',
				paddingBottom: 250,
			}}
		>
			<div
				style={{
					fontSize: 120,
					color: 'white',
					WebkitTextStroke: stroke ? '20px black' : undefined,
					transform: `scale(${scale})`,
					fontFamily: TheBoldFont,
					textTransform: 'uppercase',
					whiteSpace: 'nowrap',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};
