import { Editor } from 'obsidian';

export function sampleEditorCommand(editor: Editor): void {
	console.log(editor.getSelection());
	editor.replaceSelection('Sample Editor Command');
}
