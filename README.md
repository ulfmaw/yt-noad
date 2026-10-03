# YouTube 去广告

免费的开源浏览器扩展，删除 YouTube 播放器响应中的广告字段。适用于电脑版 Chrome、Edge 等 Chromium 浏览器的 `www.youtube.com` 页面。

[下载扩展 ZIP](https://github.com/ulfmaw/yt-noad/releases/latest/download/yt-noad.zip) · [查看源码](https://github.com/ulfmaw/yt-noad)

## 安装

1. 下载上面的 ZIP，解压到一个固定位置。
2. 打开扩展管理页面：Chrome 输入 `chrome://extensions`，Edge 输入 `edge://extensions`。开启「开发者模式」或「开发人员模式」。
3. 点击「加载已解压的扩展程序」或「加载解压缩的扩展」，选择包含 **manifest.json** 和 **noad.js** 的 `yt-noad` 文件夹。
4. 回到 YouTube，刷新页面。

保留这个文件夹，浏览器会从这里加载扩展。更新后，在扩展管理页面点击「重新加载」，再刷新 YouTube。

## 代码做了什么

- 在页面启动时处理 `window.ytInitialPlayerResponse`。
- 处理 `/youtubei/v1/player` 的 `fetch` 响应。
- 删除 `adPlacements`、`playerAds`、`adSlots`、`adBreakHeartbeatParams`，包括嵌套 `playerResponse` 中的同名字段。
- 接口返回非 JSON 等异常响应时，保留原响应。

代码不主动联网，不上传数据，不使用第三方服务，也不申请额外浏览器权限。

作用范围是电脑浏览器的 YouTube 播放器数据。YouTube 更改接口后可能失效；手机 App、电视和其他网站不在此扩展的作用范围内。

## 开发与验证

需要 Node.js 22 或更新版本：

```sh
npm test
```

测试使用本地模拟响应，检查字段清理、普通请求、异常响应和网络错误。这些测试不证明真实 YouTube 的所有广告都能被移除。

生成安装包需要 Python 3：

```sh
python build.py
```

输出为 `dist/yt-noad.zip`，仅包含扩展代码、安装说明和许可证。使用者直接下载发布页 ZIP 即可安装。

## 许可证

[MIT](LICENSE)
