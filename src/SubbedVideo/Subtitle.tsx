import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SubtitleProp} from '.';
import {FONT_FAMILY} from './constants';

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
		<div
			style={{
				position: 'absolute',
				top: 100,
				left: 100,
				fontSize: 80,
				color: 'white',
				padding: '12px 24px',
				opacity: springedScale,
				textShadow: '2px 2px 2px black',
				transform: `scale(${scale})`,
				fontFamily: FONT_FAMILY,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				overflow: 'hidden',
				maxWidth: `${maxWidthPercentage * 100}%`,
				whiteSpace: 'nowrap',
			}}
		>
			{subtitle.text}
		</div>
	);
};

export default Subtitle;
