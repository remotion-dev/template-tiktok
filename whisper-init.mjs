import fs, {existsSync} from 'fs';
import {execSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {Readable} from 'node:stream';
import {finished} from 'node:stream/promises';
import path from 'path';

const ac = new AbortController();

const downloadWindowsBinary = async () => {
	const url =
		'https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.4/whisper-bin-x64.zip';

	const filePath = path.join(process.cwd(), 'whisper-bin-x64.zip');
	const fileStream = fs.createWriteStream(filePath);

	const {body} = await fetch(url);
	await finished(Readable.fromWeb(body).pipe(fileStream));

	execSync(
		`Expand-Archive -Force ${filePath} ${path.join(
			process.cwd(),
			'whisper-bin-x64',
		)}`,
		{shell: 'powershell', stdio: 'inherit'},
	);
};

const downloadWhisperBaseModel = async () => {
	const baseModelUrl =
		'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin';

	const dirPath = path.join(process.cwd(), 'whisper-bin-x64', 'models');
	fs.mkdir(dirPath, (err) => {
		if (err) {
			return console.error(err);
		}
	});

	const filePath = path.join(dirPath, 'ggml-base.en.bin');
	const fileStream = fs.createWriteStream(filePath);

	const {body} = await fetch(baseModelUrl);
	await finished(Readable.fromWeb(body).pipe(fileStream));
	// create models directory
};

const installWhisperForMacOS = () => {
	console.log('Installing whisper. This may take a while...');
	execSync(`git clone https://github.com/ggerganov/whisper.cpp.git 2>&1`, {
		stdio: 'inherit',
	});

	execSync(`make`, {
		cwd: path.join(process.cwd(), 'whisper.cpp'),
		stdio: 'inherit',
	});

	// check if base model for english exists
	console.log('Checking whisper models...');
	if (
		!existsSync(path.join(process.cwd(), 'whisper.cpp/models/ggml-base.en.bin'))
	) {
		console.log('Downloading english base model...');
		execSync(` bash ./models/download-ggml-model.sh base.en`, {
			cwd: path.join(process.cwd(), 'whisper.cpp'),
			stdio: 'inherit',
		});
	}
};

const installWhisperForWindows = async () => {
	await downloadWindowsBinary();
	await downloadWhisperBaseModel();
};

const startInstallation = async () => {
	if (process.platform === 'darwin' || process.platform === 'linux') {
		installWhisperForMacOS();
		console.log('after install');
	}

	if (process.platform === 'win32') {
		await installWhisperForWindows();
		console.log('Download successful');
	}
};

const askForPermission = async () => {
	const readline = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const answer = await new Promise((resolve, reject) => {
		const {signal} = ac;
		const onAbort = () => {
			reject(new Error('aborted'));
		};

		signal.addEventListener('abort', onAbort, {once: true});

		readline.question(
			'Remotion Recorder would like to install whisper.cpp on your computer. Do you want to proceed? (y/n)',
			{signal},
			(userInput) => {
				signal.removeEventListener('abort', onAbort);
				resolve(userInput);
				readline.close();
			},
		);
	});

	if (answer === 'y') {
		console.log('starting installation...');
		await startInstallation();
	} else {
		console.log('installation aborted');
	}
};

await askForPermission();
