import {Composition} from 'remotion';
import {SubbedVideo} from './SubbedVideo';

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="SubbedVideo"
			component={SubbedVideo}
			durationInFrames={400}
			fps={30}
			width={1080}
			height={1920}
		/>
	);
};
