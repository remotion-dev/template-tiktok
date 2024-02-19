import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '../load-font';
import {Word} from './Word';

loadFont();

const Subtitle: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		frame: frame,
		fps,
		config: {
			damping: 200,
		},
		durationInFrames: 5,
	});

	// Overlay stroked text with normal text to create an effect where the stroke is outside
	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Word enterProgress={enter} text={text} stroke></Word>
			</AbsoluteFill>
			<AbsoluteFill>
				<Word enterProgress={enter} text={text} stroke={false}></Word>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Subtitle;
