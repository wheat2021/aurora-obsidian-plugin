import { App, Notice, Plugin } from 'obsidian';

/**
 * 重新加载当前插件
 * 这在开发时非常有用,可以快速看到代码更改的效果
 */
export async function reloadPlugin(app: App, plugin: Plugin): Promise<void> {
	const pluginId = plugin.manifest.id;
	
	try {
		// @ts-ignore - 使用 Obsidian 内部 API
		await app.plugins.disablePlugin(pluginId);
		// @ts-ignore - 使用 Obsidian 内部 API
		await app.plugins.enablePlugin(pluginId);
		
		new Notice(`插件 "${plugin.manifest.name}" 已重新加载`);
	} catch (error) {
		console.error('Failed to reload plugin:', error);
		new Notice(`重新加载插件失败: ${error.message}`);
	}
}
