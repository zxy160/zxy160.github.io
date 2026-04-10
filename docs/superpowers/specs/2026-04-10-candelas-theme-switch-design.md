# Candelas Theme Switch Design

Date: 2026-04-10
Workspace: `C:\codex\github_blog_source`

## Summary

Switch the Hexo blog from the default `landscape` theme to `candelas` with the smallest safe change set. The goal is to preserve existing content, routing, and deployment flow while replacing only the theme package and theme selection.

## Current State

- The site is a Hexo source repository.
- The active theme is `landscape` in the root config.
- The package manifest includes `hexo-theme-landscape`.
- Deployment is handled by GitHub Actions and publishes the generated site from this repository.

## Goal

Make the blog build and run with the `candelas` theme using the official install path, then verify that static output can still be generated locally.

## Non-Goals

- No visual customization beyond the default Candelas theme.
- No new widgets or integrations such as banner images, Gitalk, profile card, RSS, or likes.
- No content migration or permalink changes.
- No unrelated cleanup in posts, layouts, or deployment workflow.

## Options Considered

### Option 1: Install via npm and switch the theme name

Recommended.

Use the published `hexo-theme-candelas` package, update the root Hexo config to `theme: candelas`, and remove the now-unused `hexo-theme-landscape` dependency.

Why this option:

- Matches the upstream installation guidance.
- Keeps repository changes small.
- Makes future upgrades straightforward.

### Option 2: Vendor the theme into `themes/candelas`

Do not use for this task.

This would make theme source edits easier later, but it is heavier than needed for a minimal switch and adds more repository surface area to maintain.

### Option 3: Keep both theme dependencies temporarily

Fallback only.

This reduces rollback friction but leaves unnecessary package debt and is not needed if the build passes cleanly after the switch.

## Design

### Configuration changes

- Add `hexo-theme-candelas` to dependencies.
- Remove `hexo-theme-landscape` from dependencies.
- Change the root Hexo theme setting from `landscape` to `candelas`.
- Do not add `_config.candelas.yml` unless the build requires it.

### Build verification

Run a local clean build after the dependency and config updates:

- `npx hexo clean`
- `npx hexo generate`

Success means:

- Hexo completes without theme resolution errors.
- The `public` directory is regenerated.
- No additional mandatory theme config is required for a baseline build.

### Compatibility stance

Candelas is an older theme relative to the current Hexo major version, so compatibility is an implementation risk. The first pass should assume baseline compatibility and prove it with a real build. If the theme fails due to a small compatibility issue, fix only what is necessary to restore a successful build. Do not broaden the work into visual redesign.

## Testing

- Install dependencies successfully.
- Run a clean static generation successfully.
- Spot-check the generated home page and at least one post page if generation succeeds.

## Risks

- The theme package may rely on older Hexo theme APIs or older transitive packages.
- The generated output may differ structurally from the previous theme, even when the build succeeds.
- Some optional Candelas features may stay inactive until explicitly configured later, which is acceptable for this task.

## Implementation Boundary

This design covers only the minimal theme switch. Any follow-up styling or feature enablement should be handled as a separate change after the baseline switch is stable.
