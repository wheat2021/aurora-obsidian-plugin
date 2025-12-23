import { Editor } from 'obsidian';

/**
 * 升级标题：将所有标题提升一级（H2->H1, H3->H2, 但 H1 保持不变）
 */
export function upgradeHeadings(editor: Editor): void {
	const selection = editor.getSelection();
	
	if (!selection) {
		return;
	}

	// 匹配 Markdown 标题（## 到 ######）
	const upgraded = selection.replace(/^(#{2,6})\s+/gm, (match, hashes) => {
		// 减少一个 # 号（提升一级）
		return hashes.slice(1) + ' ';
	});

	editor.replaceSelection(upgraded);
}

/**
 * 降级标题：将所有标题降低一级（H1->H2, H2->H3, 最多到 H6）
 */
export function downgradeHeadings(editor: Editor): void {
	const selection = editor.getSelection();
	
	if (!selection) {
		return;
	}

	// 匹配 Markdown 标题（# 到 #####，不包括已经是 H6 的）
	const downgraded = selection.replace(/^(#{1,5})\s+/gm, (match, hashes) => {
		// 增加一个 # 号（降低一级）
		return '#' + hashes + ' ';
	});

	editor.replaceSelection(downgraded);
}
