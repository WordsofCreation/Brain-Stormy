# Logo assets

## Homepage GIF test slot

To test animated homepage logo ideas, place your GIF in this folder with this exact filename:

```text
homepage-logo.gif
```

The homepage hero image will try to load this file first. In a root-hosted local app, that file is served at:

```text
/logo/homepage-logo.gif
```

On the deployed GitHub Pages site, Vite adds the repository base path, so the same file is served at:

```text
/Brain-Stormy/logo/homepage-logo.gif
```

If `homepage-logo.gif` is missing or cannot load, the homepage automatically falls back to the committed SVG at:

```text
/logo/brain-stormy-logo.svg
```

Most binary logo files are ignored by git, but `public/logo/homepage-logo.gif` is intentionally allowed so you can commit and deploy a GIF when you want it to appear on the live site. If you only copy the GIF locally and do not commit it, it will not be available after deployment.

## Default fallback logo

The committed fallback logo image uses this exact filename:

```text
brain-stormy-logo.svg
```

Vite serves files in `public` from the configured app base path, so reference these files with `import.meta.env.BASE_URL` in React components.

## Pull-request friendly format

Keep committed logo artwork as SVG so PRs stay text-only. Binary logo files are ignored by the repository-level `.gitignore` and should be converted to SVG before opening a PR.
