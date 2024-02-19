import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {SubtitleProp} from '.';
import {TheBoldFont, loadFont} from '../load-font';

loadFont();

const Subtitle: React.FC<{subtitle: SubtitleProp}> = ({subtitle}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const subtitleStartFrame = (subtitle.offsets.from * fps) / 1000;
	const subtitleEndFrame = (subtitle.offsets.to * fps) / 1000;
	const springedScale = spring({
		frame: frame - subtitleStartFrame,
		fps,
		config: {
			damping: 200,
		},
		durationInFrames: 5,
	});
	const scale = interpolate(springedScale, [0, 1], [0.8, 1]);

	if (frame < subtitleStartFrame || frame >= subtitleEndFrame) {
		return null;
	}

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
					padding: '12px 24px',
					textShadow: '2px 2px 2px black',
					transform: `scale(${scale})`,
					fontFamily: TheBoldFont,
					overflow: 'hidden',
					textTransform: 'uppercase',
					whiteSpace: 'nowrap',
				}}
			>
				{subtitle.text}
			</div>
		</AbsoluteFill>
	);
};

export default Subtitle;
