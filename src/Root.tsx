import {Composition, staticFile} from 'remotion';
import {CaptionedVideo} from './CaptionedVideo';

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="CaptionedVideo"
			component={CaptionedVideo}
			durationInFrames={400}
			fps={30}
			width={1080}
			height={1920}
			defaultProps={{
				src: staticFile('sample-video.mp4'),
			}}
		/>
	);
};
