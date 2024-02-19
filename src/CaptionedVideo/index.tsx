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
import {ZoomInEffect} from '../ZoomInEffect';
import {loadFont} from '../load-font';
import {NoCaptionFile} from './NoCaptionFile';

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
			await loadFont();
			const res = await fetch(subtitlesFile);
			const data = await res.json();
			setSubtitles(data.transcription);
		} catch (e) {
			cancelRender(e);
		}
	}, [fileExists, subtitlesFile]);

	useEffect(() => {
		fetchSubtitles();

		// TODO: Does not work, maybe with 4.0.116
		const c = watchStaticFile(subtitlesFile, () => {
			fetchSubtitles();
		});

		return () => {
			c.cancel();
		};
	}, [fetchSubtitles, src, subtitlesFile]);

	// A <AbsoluteFill> is just a absolutely positioned <div>!
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill>
				<ZoomInEffect>
					<OffthreadVideo
						style={{
							objectFit: 'cover',
						}}
						src={src}
					/>
				</ZoomInEffect>
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
			{fileExists ? null : <NoCaptionFile />}
		</AbsoluteFill>
	);
};
