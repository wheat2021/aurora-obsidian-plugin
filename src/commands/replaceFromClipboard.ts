import { App, Notice } from 'obsidian';

export async function replaceNoteFromClipboard(app: App): Promise<void> {
	const activeFile = app.workspace.getActiveFile();
	
	if (!activeFile) {
		new Notice('没有活动笔记');
		return;
	}

	try {
		// 读取剪贴板内容
		const clipboardText = await navigator.clipboard.readText();
		
		if (!clipboardText) {
			new Notice('剪贴板为空');
			return;
		}

		// 将剪贴板内容写入活动文件
		await app.vault.modify(activeFile, clipboardText);
		
		new Notice(`已用剪贴板内容替换 ${activeFile.name}`);
	} catch (error) {
		console.error('替换笔记内容失败:', error);
		new Notice('读取剪贴板或写入文件失败');
	}
}
