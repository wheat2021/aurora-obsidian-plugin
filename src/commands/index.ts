import { Plugin, MarkdownView } from 'obsidian';
import { copyNoteFullPath } from '@/commands/copyNotePath';
import { openSampleModal } from '@/commands/sampleModal';
import { sampleEditorCommand } from '@/commands/editorCommands';
import { replaceNoteFromClipboard } from '@/commands/replaceFromClipboard';
import { reloadPlugin } from '@/commands/reloadPlugin';

export function registerCommands(plugin: Plugin): void {
	// Simple modal command
	plugin.addCommand({
		id: 'open-sample-modal-simple',
		name: 'Open sample modal (simple)',
		callback: () => {
			openSampleModal(plugin.app);
		}
	});

	// Editor command
	plugin.addCommand({
		id: 'sample-editor-command',
		name: 'Sample editor command',
		editorCallback: (editor, _view) => {
			sampleEditorCommand(editor);
		}
	});

	// Complex modal command with condition check
	plugin.addCommand({
		id: 'open-sample-modal-complex',
		name: 'Open sample modal (complex)',
		checkCallback: (checking: boolean) => {
			const markdownView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
			if (markdownView) {
				if (!checking) {
					openSampleModal(plugin.app);
				}
				return true;
			}
		}
	});

	// Copy current note's full path
	plugin.addCommand({
		id: 'copy-note-full-path',
		name: 'Copy note full path',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (activeFile) {
				if (!checking) {
					copyNoteFullPath(plugin.app);
				}
				return true;
			}
			return false;
		}
	});

	// Replace active note content with clipboard
	plugin.addCommand({
		id: 'replace-note-from-clipboard',
		name: 'Replace note content from clipboard',
		checkCallback: (checking: boolean) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			if (activeFile) {
				if (!checking) {
					replaceNoteFromClipboard(plugin.app);
				}
				return true;
			}
			return false;
		}
	});

	// Reload plugin (useful for development)
	plugin.addCommand({
		id: 'reload-plugin',
		name: 'Reload plugin',
		callback: async () => {
			await reloadPlugin(plugin.app, plugin);
		}
	});
}
