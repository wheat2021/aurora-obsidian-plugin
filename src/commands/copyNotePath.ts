import { App, Notice } from 'obsidian';

export function copyNoteFullPath(app: App): void {
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		new Notice('No active file');
		return;
	}

	// @ts-ignore - vault.adapter.basePath is available but not in types
	const vaultPath = app.vault.adapter.basePath;
	const fullPath = `${vaultPath}/${activeFile.path}`;

	navigator.clipboard.writeText(fullPath).then(() => {
		new Notice(`Path copied: ${fullPath}`);
	}).catch(err => {
		new Notice('Failed to copy path');
		console.error('Failed to copy path:', err);
	});
}
