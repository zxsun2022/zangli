const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'zangli-generated-'));
const generatedFiles = [
	'index.html', 'tw/index.html', 'en/index.html', 'bo/index.html',
	'widget/index.html', 'sw.js', 'calendar/zangli-special-days.ics'
];

try {
	for (const script of ['generate-pages.js', 'generate-subscription.js']) {
		const result = spawnSync(process.execPath, [path.join(__dirname, script), temporaryRoot], { stdio: 'inherit' });
		if (result.status !== 0) process.exit(result.status || 1);
	}

	const drift = generatedFiles.filter(file => {
		const expected = fs.readFileSync(path.join(temporaryRoot, file));
		const current = fs.readFileSync(path.join(root, file));
		return !expected.equals(current);
	});

	if (drift.length) {
		console.error(`Generated files are stale:\n${drift.map(file => `- ${file}`).join('\n')}`);
		console.error('Run `npm run generate` and commit the results.');
		process.exit(1);
	}
	console.log(`Generated-file checks passed for ${generatedFiles.length} files.`);
} finally {
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
