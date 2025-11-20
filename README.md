# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

这是一个 Obsidian 社区插件项目,使用 TypeScript 开发并通过 esbuild 打包为 JavaScript。

- **入口点**: `main.ts` 编译为 `main.js` 并被 Obsidian 加载
- **必需发布文件**: `main.js`, `manifest.json`, 以及可选的 `styles.css`
- **包管理器**: pnpm (必须使用 pnpm)
- **打包工具**: esbuild (必需)

## 常用命令

### 开发
```bash
pnpm dev
```
监视模式,自动重新编译 `main.ts` 为 `main.js`

### 生产构建
```bash
pnpm build
```
先进行 TypeScript 类型检查,然后生产构建(minified)

### 部署到本地 Obsidian
```bash
pnpm deploy
```
构建并复制插件文件到 Obsidian 插件目录

### Lint
```bash
eslint main.ts
# 或分析整个源目录
eslint ./src/
```

### 版本更新
```bash
pnpm version patch|minor|major
```
自动更新 `manifest.json`、`package.json` 和 `versions.json` 中的版本号

## 代码架构

### 文件组织原则

**重要**: 将代码拆分为多个文件,避免将所有内容放入 `main.ts`。推荐结构:

```
main.ts              # 插件入口,仅处理生命周期(onload/onunload)
src/
  commands/          # 命令实现
    index.ts         # 命令注册入口,导出 registerCommands() 函数
    commandName.ts   # 单个命令的具体实现
  settings.ts        # 设置接口和默认值
  ui/                # UI 组件、模态框、视图
  utils/             # 工具函数、辅助函数
  types.ts           # TypeScript 接口和类型
```

**注意**: `main.ts` 必须位于根目录,因为 `esbuild.config.mjs` 将其作为入口点。其他源代码文件应放在 `src/` 目录下。

### 插件生命周期

插件类继承自 `Plugin`,核心生命周期:
- `onload()`: 插件加载时执行,注册命令、事件监听器、设置等
- `onunload()`: 插件卸载时执行清理
- 使用 `this.register*()` 系列方法注册资源以确保自动清理

### 主要组件

**Plugin 类**:
- 继承自 Obsidian 的 `Plugin`
- 通过 `addCommand()` 注册命令
- 通过 `addSettingTab()` 添加设置面板
- 使用 `loadData()`/`saveData()` 持久化设置
- 使用 `registerDomEvent()` 和 `registerInterval()` 注册需要清理的资源

**Settings**:
- 定义接口并提供默认值
- 在 `onload` 中使用 `Object.assign()` 合并默认值和保存的数据
- 修改后调用 `saveSettings()` 持久化

**Modal**:
- 继承自 `Modal`
- 实现 `onOpen()` 和 `onClose()`
- 通过 `contentEl` 操作 DOM

**SettingTab**:
- 继承自 `PluginSettingTab`
- 实现 `display()` 方法渲染设置 UI

## Manifest 规则

`manifest.json` 必需字段:
- `id`: 插件 ID (发布后不可更改)
- `name`: 插件名称
- `version`: 语义化版本 `x.y.z`
- `minAppVersion`: 最低兼容的 Obsidian 版本
- `description`: 插件描述
- `isDesktopOnly`: 是否仅限桌面端

## 构建和发布

### 本地测试
将 `main.js`, `manifest.json`, `styles.css` 复制到:
```
<Vault>/.obsidian/plugins/<plugin-id>/
```
然后在 Obsidian 设置中重新加载插件。

### 发布流程
1. 更新 `manifest.json` 中的 `version` 和 `minAppVersion`
2. 运行 `pnpm version patch/minor/major` 自动更新版本信息
3. 创建 GitHub Release,tag 必须完全匹配 `manifest.json` 中的版本号(不要加 `v` 前缀)
4. 将 `manifest.json`, `main.js`, `styles.css` 作为 release assets 附加

### 构建输出
- 不要提交构建产物(`main.js`, `node_modules/`等)到版本控制
- 发布的文件必须位于插件文件夹根目录

## TypeScript 配置

- 启用严格模式: `"strictNullChecks": true`, `"noImplicitAny": true`
- 目标: ES6
- 模块系统: ESNext
- 所有外部依赖(Obsidian API、CodeMirror、Electron 等)在 `esbuild.config.mjs` 中标记为 external

## 编码约定

### 保持 main.ts 简洁
- 只关注插件生命周期管理
- 将功能逻辑委托给单独的模块
- 超过 200-300 行的文件应拆分为更小的模块

### 命令组织

**命令应拆分为独立文件**:

1. **命令实现** (`src/commands/commandName.ts`): 包含命令的具体业务逻辑
   ```typescript
   import { App, Notice } from 'obsidian';
   
   export function doSomething(app: App): void {
     // 命令的具体实现
   }
   ```

2. **命令注册** (`src/commands/index.ts`): 统一注册所有命令
   ```typescript
   import { Plugin } from 'obsidian';
   import { doSomething } from './commandName';
   
   export function registerCommands(plugin: Plugin): void {
     plugin.addCommand({
       id: 'command-id',
       name: 'Command Name',
       callback: () => doSomething(plugin.app)
     });
   }
   ```

3. **在 main.ts 中调用**:
   ```typescript
   import { registerCommands } from './src/commands';
   
   async onload() {
     registerCommands(this);
   }
   ```

**命令注册规则**:
- 使用稳定的命令 ID,发布后不要重命名
- 通过 `addCommand()` 注册,支持 `callback` 或 `editorCallback`
- 使用 `checkCallback` 实现条件性命令
- 命令实现应与注册逻辑分离,保持单一职责

### 资源清理
所有需要清理的资源必须使用 `register*` 辅助方法:
```typescript
this.registerEvent(this.app.workspace.on('file-open', handler));
this.registerDomEvent(document, 'click', handler);
this.registerInterval(window.setInterval(handler, interval));
```

### 移动端兼容
- 避免 Node/Electron API 以支持移动端
- 如果必须使用桌面 API,设置 `"isDesktopOnly": true`
- 注意内存和存储限制

## 安全与隐私

- 默认离线/本地操作
- 如需网络请求,必须对功能必要且有明确文档说明
- 不收集隐藏的遥测数据
- 不执行远程代码或自动更新插件代码
- 只读写 vault 内必要的文件
- 明确披露使用的外部服务和数据传输

## 性能最佳实践

- 保持启动轻量,延迟加载重量级工作
- 避免在 `onload` 中执行长时间运行的任务
- 批量磁盘访问,避免过度扫描 vault
- 对文件系统事件响应使用防抖/节流
