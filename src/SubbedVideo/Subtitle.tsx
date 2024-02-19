import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {SubtitleProp} from '.';
import {FONT_FAMILY} from './constants';
import {loadFont} from '../load-font';

loadFont();

const Subtitle: React.FC<{subtitle: SubtitleProp}> = ({subtitle}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const subtitleStartFrame = (subtitle.offsets.from * fps) / 1000;
	const subtitleEndFrame = (subtitle.offsets.to * fps) / 1000;
	const springedScale = spring({
		frame: frame - subtitleStartFrame,
		fps,
	});
	const scale = interpolate(springedScale, [0, 1], [0.8, 1]);
	const maxWidthPercentage = interpolate(springedScale, [0, 1], [0, 1]);

	if (frame < subtitleStartFrame || frame > subtitleEndFrame) {
		return null;
	}

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					fontSize: 80,
					color: 'white',
					padding: '12px 24px',
					opacity: springedScale,
					textShadow: '2px 2px 2px black',
					transform: `scale(${scale})`,
					fontFamily: FONT_FAMILY,
					overflow: 'hidden',
					textTransform: 'uppercase',
					maxWidth: `${maxWidthPercentage * 100}%`,
					whiteSpace: 'nowrap',
				}}
			>
				{subtitle.text}
			</div>
		</AbsoluteFill>
	);
};

export default Subtitle;
