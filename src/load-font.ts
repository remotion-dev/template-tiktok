import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const TheBoldFont = `TheBoldFont`;

let loaded = false;

export const loadFont = () => {
	if (loaded) {
		return;
	}

	const waitForFont = delayRender();

	loaded = true;

	const font = new FontFace(
		TheBoldFont,
		`url('${staticFile('theboldfont.ttf')}') format('truetype')`,
	);

	font
		.load()
		.then(() => {
			document.fonts.add(font);
			continueRender(waitForFont);
		})
		.catch((err) => {
			cancelRender(err);
		});
};
