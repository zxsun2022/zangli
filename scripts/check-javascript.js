const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const excluded = new Set(['.git', '.claude', '.gstack', 'node_modules']);
const files = [];

function collect(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (excluded.has(entry.name)) continue;
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) collect(target);
		else if (entry.isFile() && entry.name.endsWith('.js')) files.push(target);
	}
}

collect(root);
for (const file of files.sort()) {
	const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
	if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`JavaScript syntax checks passed for ${files.length} files.`);
