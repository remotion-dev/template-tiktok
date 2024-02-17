import {useEffect, useState} from 'react';
import {AbsoluteFill, staticFile, Video} from 'remotion';
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
		fetch(staticFile('/sample-video.json'))
			.then((res) => {
				console.log({res});
				return res.json();
			})
			.then((data) => {
				setSubtitles(data.transcription);
			});
	}, []);

	// A <AbsoluteFill> is just a absolutely positioned <div>!
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<>
				{/* A <Video> is a video element that plays back a video file */}
				<Video
					src={staticFile('/sample-video.mp4')}
					style={{
						height: 1920,
						width: 1080,
					}}
				/>
				{subtitles.map((subtitle, index) => {
					return <Subtitle key={index} subtitle={subtitle} />;
				})}
			</>
		</AbsoluteFill>
	);
};
