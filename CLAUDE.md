# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Obsidian 社区插件项目,使用 TypeScript 开发并通过 esbuild 打包。

- **入口点**: `main.ts` 编译为 `main.js` 并被 Obsidian 加载
- **必需发布文件**: `main.js`, `manifest.json`, 可选 `styles.css`
- **包管理器**: pnpm (必须使用)
- **打包工具**: esbuild
- **路径别名**: 配置了 `@/*` 映射到 `src/*`

## 常用命令

### 开发模式
```bash
pnpm dev
```
监视模式,自动重新编译 `main.ts` 为 `main.js`

### 构建
```bash
pnpm build
```
TypeScript 类型检查 + 生产构建(minified)

### 部署到本地 Obsidian
```bash
pnpm deploy
```
构建并复制到 `/Users/terrychen/Notes/.obsidian/plugins/sample-plugin/`

### 代码检查
```bash
eslint main.ts
eslint ./src/
```

### 版本更新
```bash
pnpm version patch|minor|major
```
自动更新 `manifest.json`, `package.json`, `versions.json`

## 代码架构

### 文件组织原则

**关键规则**: 保持 `main.ts` 简洁,仅处理插件生命周期。将功能逻辑拆分到 `src/` 目录。

```
main.ts                  # 插件入口,仅生命周期管理(onload/onunload)
src/
  commands/
    index.ts             # 命令注册中心,导出 registerCommands()
    commandName.ts       # 单个命令的业务逻辑实现
  ui/                    # Modal、View 等 UI 组件
  utils/                 # 工具函数
  types.ts               # TypeScript 类型定义
```

**注意**: `main.ts` 必须在根目录(esbuild 入口点要求)

### 路径别名配置

项目配置了 `@/*` 路径别名:
- **tsconfig.json**: `"@/*": ["src/*"]`
- **esbuild.config.mjs**: 自定义 aliasPlugin 在构建时解析别名

**使用示例**:
```typescript
import { registerCommands } from '@/commands';
import { copyNoteFullPath } from '@/commands/copyNotePath';
```

### 命令组织模式

项目采用模块化命令组织:

1. **命令实现** (`src/commands/commandName.ts`): 纯业务逻辑
   ```typescript
   import { App } from 'obsidian';

   export function doSomething(app: App): void {
     // 具体实现
   }
   ```

2. **命令注册** (`src/commands/index.ts`): 集中注册所有命令
   ```typescript
   import { Plugin } from 'obsidian';
   import { doSomething } from '@/commands/commandName';

   export function registerCommands(plugin: Plugin): void {
     plugin.addCommand({
       id: 'command-id',
       name: 'Command Name',
       callback: () => doSomething(plugin.app)
     });
   }
   ```

3. **插件入口调用** (`main.ts`):
   ```typescript
   import { registerCommands } from '@/commands';

   async onload() {
     registerCommands(this);
   }
   ```

**命令类型**:
- `callback`: 普通命令
- `editorCallback`: 编辑器命令,接收 `editor` 和 `view`
- `checkCallback`: 条件命令,checking=true 时检查是否可用

### 插件生命周期

- `onload()`: 注册命令、事件、设置等
- `onunload()`: 清理工作
- 使用 `this.register*()` 方法注册资源确保自动清理:
  - `registerEvent()`: 事件监听
  - `registerDomEvent()`: DOM 事件
  - `registerInterval()`: 定时器

### Settings 模式

```typescript
interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

// 加载
async loadSettings() {
  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
}

// 保存
async saveSettings() {
  await this.saveData(this.settings);
}
```

## TypeScript 配置

- **严格模式**: `strictNullChecks: true`, `noImplicitAny: true`
- **目标**: ES6
- **模块系统**: ESNext
- **路径映射**: `@/*` → `src/*`

## esbuild 配置要点

- **入口**: `main.ts` (必须在根目录)
- **外部依赖**: Obsidian API, CodeMirror, Electron 等标记为 external
- **自定义插件**: aliasPlugin 处理 `@/` 路径别名
- **开发模式**: watch + inline sourcemap
- **生产模式**: minify + tree shaking

## Manifest 规则

必需字段:
- `id`: 插件唯一标识(发布后不可改)
- `name`: 插件名称
- `version`: 语义化版本
- `minAppVersion`: 最低 Obsidian 版本
- `description`: 描述
- `isDesktopOnly`: 是否仅桌面端

## 发布流程

1. 更新版本: `pnpm version patch/minor/major`
2. 创建 GitHub Release,tag 名称与 `manifest.json` 中版本号一致(无 `v` 前缀)
3. 附加发布文件: `main.js`, `manifest.json`, `styles.css`

## 开发最佳实践

### 模块化
- 文件超过 200-300 行应拆分
- 命令实现与注册分离
- 使用路径别名 `@/` 简化导入

### 资源管理
- 所有需要清理的资源使用 `register*()` 方法
- 避免内存泄漏

### 移动端兼容
- 避免 Node/Electron API
- 桌面专用功能设置 `"isDesktopOnly": true`

### 性能
- 延迟加载重量级操作
- 避免在 `onload` 中执行长任务
- 对文件系统事件使用防抖/节流
