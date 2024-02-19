import {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, OffthreadVideo, staticFile} from 'remotion';
import Subtitle from './Subtitle';

export type SubtitleProp = {
	offsets: {
		from: number;
		to: number;
	};
	text: string;
};

export const SubbedVideo: React.FC = () => {
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);

	useEffect(() => {
		// Fetch the subtitles saved in public folder from the server
		fetch(staticFile('sample-video.json'))
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
				<OffthreadVideo src={staticFile('sample-video.mp4')} />
			</AbsoluteFill>
			{subtitles.map((subtitle, index) => {
				return <Subtitle key={index} subtitle={subtitle} />;
			})}
		</AbsoluteFill>
	);
};
