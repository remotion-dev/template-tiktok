import {useCallback, useEffect, useState} from 'react';
import {
	AbsoluteFill,
	cancelRender,
	OffthreadVideo,
	Sequence,
	useVideoConfig,
} from 'remotion';
import Subtitle from './Subtitle';

export type SubtitleProp = {
	offsets: {
		from: number;
		to: number;
	};
	text: string;
};

export const CaptionedVideo: React.FC<{
	src: string;
}> = ({src}) => {
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
	const {fps} = useVideoConfig();

	const fetchSubtitles = useCallback(async () => {
		try {
			const subtitlesFile = src.replace(/.mp4$/, '.json');
			const res = await fetch(subtitlesFile);
			const data = await res.json();
			setSubtitles(data.transcription);
		} catch (e) {
			cancelRender(e);
		}
	}, []);

	useEffect(() => {
		fetchSubtitles();
	}, []);

	// A <AbsoluteFill> is just a absolutely positioned <div>!
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill>
				<OffthreadVideo src={src} />
			</AbsoluteFill>
			{subtitles.map((subtitle, index) => {
				const subtitleStartFrame = (subtitle.offsets.from * fps) / 1000;
				const subtitleEndFrame = (subtitle.offsets.to * fps) / 1000;

				return (
					<Sequence
						from={subtitleStartFrame}
						durationInFrames={subtitleEndFrame - subtitleStartFrame}
					>
						<Subtitle key={index} text={subtitle.text} />;
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};
