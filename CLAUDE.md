# CLAUDE.md

实时英中双向翻译器 — Electron 桌面应用。

## 启动命令

```bash
npm start          # 开发模式运行
npm run build      # 打包 Windows 便携版（electron-builder）
```

## 架构

### 进程模型

- **`main.js`** — Electron 主进程。创建标准窗口（520×600），`contextIsolation: true`。
- **`preload.js`** — 安全桥接层，`contextBridge.exposeInMainWorld`。
- **`renderer.js`** — 全部 UI 逻辑在渲染进程执行，监听输入、调用翻译 API、渲染结果。

### 双向翻译

支持 EN → 中文 和 中文 → EN 两个方向。点击中间圆形箭头按钮切换，或按 `Ctrl+S` 快捷键。

切换方向时自动把当前输出文本移入输入区并重新翻译，方便即时回译验证。

### 翻译引擎

使用 [MyMemory API](https://mymemory.translated.net/)（免费，无需密钥）：
```
# 英译中
GET https://api.mymemory.translated.net/get?q={text}&langpair=en|zh-CN
# 中译英
GET https://api.mymemory.translated.net/get?q={text}&langpair=zh-CN|en
```
返回 `responseData.translatedText` 即为翻译结果。

### 实时翻译流程

1. `textarea` `input` 事件触发
2. 500ms 防抖（debounce）
3. 空文本 → 清空输出区
4. 非空 → 调用 MyMemory API → 渲染结果
5. 出错时保留上一次翻译 + 状态栏变红

### UI 布局

- 状态栏（🟢就绪 / 🟡翻译中 / 🔴错误）+ 方向标签
- 输入 textarea（上半屏），语言标签随方向切换
- 圆形箭头切换按钮（翻译时弹跳动画）
- 输出区（下半屏）+ 复制按钮
- 底部信息栏（字符数 + 引擎名）

### 快捷键

| 按键 | 功能 |
|------|------|
| `Ctrl+S` | 切换翻译方向 |
| `Ctrl+C`（无选中时）| 复制翻译结果 |
