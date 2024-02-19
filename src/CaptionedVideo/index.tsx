import {useEffect, useState} from 'react';
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

	useEffect(() => {
		// Fetch the subtitles saved in public folder from the server
		fetch(src.replace(/.mp4$/, '.json'))
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				setSubtitles(data.transcription);
			})
			.catch((err) => {
				cancelRender(err);
			});
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
