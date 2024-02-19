import {useCallback, useEffect, useState} from 'react';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	cancelRender,
	getStaticFiles,
	OffthreadVideo,
	Sequence,
	useVideoConfig,
	watchStaticFile,
} from 'remotion';
import {z} from 'zod';
import Subtitle from './Subtitle';
import {getVideoMetadata} from '@remotion/media-utils';
import {loadFont} from '../load-font';

export type SubtitleProp = {
	offsets: {
		from: number;
		to: number;
	};
	text: string;
};

export const captionedVideoSchema = z.object({
	src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
	z.infer<typeof captionedVideoSchema>
> = async ({props}) => {
	await loadFont();

	const fps = 30;
	const metadata = await getVideoMetadata(props.src);

	return {
		fps,
		durationInFrames: Math.floor(metadata.durationInSeconds * fps),
	};
};

export const CaptionedVideo: React.FC<{
	src: string;
}> = ({src}) => {
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
	const {fps} = useVideoConfig();

	const subtitlesFile = src.replace(/.mp4$/, '.json');
	const files = getStaticFiles();
	const fileExists = files.find((f) => {
		return f.src === subtitlesFile;
	});

	const fetchSubtitles = useCallback(async () => {
		if (!fileExists) {
			return;
		}

		try {
			const res = await fetch(subtitlesFile);
			const data = await res.json();
			setSubtitles(data.transcription);
		} catch (e) {
			cancelRender(e);
		}
	}, [fileExists, subtitlesFile]);

	useEffect(() => {
		fetchSubtitles();

		const c = watchStaticFile(src, () => {
			fetchSubtitles();
		});

		return () => {
			c.cancel();
		};
	}, [fetchSubtitles, src]);

	// A <AbsoluteFill> is just a absolutely positioned <div>!
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill>
				<OffthreadVideo
					style={{
						objectFit: 'cover',
					}}
					src={src}
				/>
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
