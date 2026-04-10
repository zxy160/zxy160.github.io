# zxy160 Hexo Source

这个目录现在是博客的唯一源码目录。

推荐工作流已经改成：

`写文章 -> git commit -> git push -> GitHub Actions 自动构建并发布 GitHub Pages`

不再把 `public/` 作为源码保存，也不再依赖 `hexo deploy` 直推静态文件。

## 常用命令

安装依赖：

```powershell
npm install
```

如果你在 Windows PowerShell 里遇到执行策略拦截 `npm` / `npx`，就改用：

```powershell
npm.cmd install
```

新建文章：

```powershell
npx hexo new "文章标题"
```

Windows PowerShell 兼容写法：

```powershell
npx.cmd hexo new "文章标题"
```

本地预览：

```powershell
npx hexo server
```

Windows PowerShell 兼容写法：

```powershell
npx.cmd hexo server
```

本地生成：

```powershell
npx hexo clean
npx hexo generate
```

## 发布方式

现在的发布方式是 `git push`，不是 `hexo deploy`。

只要把这份源码推到 GitHub 仓库默认分支，GitHub Actions 就会自动：

1. 安装依赖
2. 运行 `hexo generate`
3. 发布到 GitHub Pages

## 第一次启用 GitHub Pages

如果你准备把这个源码目录作为 `zxy160.github.io` 仓库的新内容，需要在 GitHub 仓库网页里确认：

1. 打开仓库 `zxy160/zxy160.github.io`
2. 进入 `Settings`
3. 打开 `Pages`
4. 在 `Build and deployment` 里把 `Source` 设为 `GitHub Actions`

仓库里负责自动发布的工作流文件是：

`C:\codex\github_blog_source\.github\workflows\pages.yml`

## 换电脑迁移

换电脑时，不需要迁移 `public/`。

只要迁移这份源码仓库：

1. 安装 Git
2. 安装 Node.js
   当前项目要求 Node `>= 20.19.0`
3. 克隆源码仓库
4. 运行 `npm install`
5. 运行 `npx hexo server` 本地预览
6. 写完文章后直接 `git push`

如果你使用支持 `.nvmrc` 的 Node 版本管理工具，也可以直接读取仓库里的 Node 版本约定。

## 当前目录说明

- `source/`：文章和页面源码
- `scaffolds/`：Hexo 模板
- `_config.yml`：站点主配置
- `.github/workflows/pages.yml`：GitHub Pages 自动发布工作流
- `public/`：本地生成目录，不提交
- `db.json`：Hexo 本地缓存，不提交
