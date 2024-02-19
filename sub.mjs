import {execSync} from 'node:child_process';
import {
	existsSync,
	readFileSync,
	rmSync,
	writeFileSync,
	lstatSync,
	mkdirSync,
	readdirSync,
} from 'node:fs';
import os from 'node:os';
import path from 'path';
import prettier from 'prettier';
import {
	WHISPER_MODEL,
	WHISPER_PATH,
	WHISPER_VERSION,
} from './whisper-config.mjs';
import {
	downloadWhisperModel,
	installWhisperCpp,
} from '@remotion/install-whisper-cpp';

function mergeTranscriptions(transcriptions) {
	const merged = [];
	let currentText = '';
	let currentFrom = '';
	let currentTo = '';

	transcriptions.forEach((item, index) => {
		const text = item.text;
		// If text starts with a space, push the currentText (if it exists) and start a new one
		if (text.startsWith(' ') && currentTo - currentFrom > 200) {
			if (currentText !== '') {
				merged.push({
					offsets: {from: currentFrom, to: currentTo},
					text: currentText,
				});
			}
			// Start a new sentence
			currentText = text.trimStart();
			currentFrom = item.offsets.from;
			currentTo = item.offsets.to;
		} else {
			// Continuation or start of a new sentence without leading space
			if (currentText === '') {
				// It's the start of the document or after a sentence that started with a space
				currentFrom = item.offsets.from;
			}
			currentText += text;
			currentTo = item.offsets.to;
		}

		// Ensure the last sentence is added
		if (index === transcriptions.length - 1 && currentText !== '') {
			merged.push({
				offsets: {from: currentFrom, to: currentTo},
				text: currentText,
			});
		}
	});

	return merged;
}

const extractToTempAudioFile = (fileToTranscribe, tempOutFile) => {
	// extracting audio from mp4 and save it as 16khz wav file
	execSync(
		`npx remotion ffmpeg -i ${fileToTranscribe} -ar 16000 ${tempOutFile} -y`,
		{stdio: 'inherit'},
	);
};

const subFile = async (filePath, fileName, folder) => {
	const outPath = path.join(
		process.cwd(),
		'public',
		folder,
		fileName.replace('.wav', '.json'),
	);

	const executable = os.platform() === 'win32' ? 'main.exe' : './main';

	const modelPath = path.join(WHISPER_PATH, `ggml-${WHISPER_MODEL}.bin`);

	execSync(
		`${executable} -f ${filePath} --output-file ${
			outPath.split('.')[0]
		} --output-json --max-len 1 -m ${modelPath}`,
		{cwd: WHISPER_PATH},
	);

	let json = readFileSync(outPath, 'utf8');
	const parsedJson = await JSON.parse(json);
	const mergedTranscriptions = mergeTranscriptions(parsedJson.transcription);
	parsedJson.transcription = mergedTranscriptions;
	const options = await prettier.resolveConfig('.');
	const formatted = await prettier.format(JSON.stringify(parsedJson), {
		...options,
		parser: 'json',
	});
	writeFileSync(outPath.replace('webcam', 'subs'), formatted);
	rmSync(filePath);
};

const processVideo = async (fullPath, entry, directory) => {
	if (!fullPath.endsWith('.mp4')) {
		return;
	}

	const isTranscribed = existsSync(
		fullPath.replace('.mp4', '.json').replace('webcam', 'subs'),
	);
	if (isTranscribed) {
		return;
	}
	let shouldRemoveTempDirectory = false;
	if (!existsSync(path.join(process.cwd(), 'temp'))) {
		mkdirSync(`temp`);
		shouldRemoveTempDirectory = true;
	}
	console.log('Extracting audio from file');

	const tempWavFileName = entry.split('.')[0] + '.wav';
	const tempOutFilePath = path.join(process.cwd(), `temp/${tempWavFileName}`);

	extractToTempAudioFile(fullPath, tempOutFilePath);
	await subFile(
		tempOutFilePath,
		tempWavFileName,
		path.relative('public', directory),
	);
	if (shouldRemoveTempDirectory) {
		rmSync(path.join(process.cwd(), 'temp'), {recursive: true});
	}
};

const processDirectory = async (directory) => {
	const entries = readdirSync(directory).filter((f) => f !== '.DS_Store');

	for (const entry of entries) {
		const fullPath = path.join(directory, entry);
		const stat = lstatSync(fullPath);

		if (stat.isDirectory()) {
			await processDirectory(fullPath); // Recurse into subdirectories
		} else {
			await processVideo(fullPath, entry, directory);
		}
	}
};

await installWhisperCpp({to: WHISPER_PATH, version: WHISPER_VERSION});
await downloadWhisperModel({folder: WHISPER_PATH, model: WHISPER_MODEL});

// read arguments for filename if given else process all files in the directory
const hasArgs = process.argv.length > 2;

if (!hasArgs) {
	await processDirectory(path.join(process.cwd(), 'public'));
	process.exit(0);
}

for (const arg of process.argv.slice(2)) {
	const fullPath = path.join(process.cwd(), arg);
	const stat = lstatSync(fullPath);

	if (stat.isDirectory()) {
		await processDirectory(fullPath);
		continue;
	}

	console.log(`Processing file ${fullPath}`);
	const directory = path.dirname(fullPath);
	const fileName = path.basename(fullPath);
	await processVideo(fullPath, fileName, directory);
}
