# Fuente Hexo de zxy160

Este repositorio contiene el código fuente de Hexo para `zxy160.github.io`.

Proceso de publicación:

`git push -> GitHub Actions -> GitHub Pages`

## Desarrollo local

Instala las dependencias:

```powershell
npm install
```

Alternativa en PowerShell:

```powershell
npm.cmd install
```

Crea un artículo:

```powershell
npx hexo new "Título del artículo"
```

Visualiza una vista previa local:

```powershell
npx hexo server
```

Alternativa en PowerShell:

```powershell
npx.cmd hexo server
```

Genera la página localmente:

```powershell
npx hexo clean
npx hexo generate
```

## GitHub Pages

En la configuración del repositorio, establece `Páginas -> Fuente` en `GitHub Actions`.

El archivo del flujo de trabajo se encuentra en:

`C:\codex\github_blog_source\.github\workflows\pages.yml`

## Migración a otro equipo

1. Instala Git.
2. Instala Node.js (>= 20.19.0).
3. Clona el repositorio fuente.
4. Ejecuta `npm install`.
5. Ejecuta `npx hexo server`.
6. Escribe artículos y ejecuta `git push`.
