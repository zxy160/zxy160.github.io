# zxy160 Hexo Source

This repository stores the Hexo source for `zxy160.github.io`.

发布流程：

`git push -> GitHub Actions -> GitHub Pages`

## Local development

Install dependencies:

```powershell
npm install
```

PowerShell fallback:

```powershell
npm.cmd install
```

Create a post:

```powershell
npx hexo new "文章标题"
```

Preview locally:

```powershell
npx hexo server
```

PowerShell fallback:

```powershell
npx.cmd hexo server
```

Build locally:

```powershell
npx hexo clean
npx hexo generate
```

## GitHub Pages

In repository settings, set `Pages -> Source` to `GitHub Actions`.

The workflow file is:

`C:\codex\github_blog_source\.github\workflows\pages.yml`

## Migration to another computer

1. Install Git
2. Install Node.js `>= 20.19.0`
3. Clone the source repository
4. Run `npm install`
5. Run `npx hexo server`
6. Write posts and `git push`
