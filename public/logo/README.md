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

If `homepage-logo.gif` is missing or cannot load, the homepage automatically falls back to the committed SVG at:

```text
/logo/brain-stormy-logo.svg
```

Because GIF files are binary and can be large, `public/logo/*.gif` is intentionally ignored by git. You can swap different local GIF ideas into this filename without committing them.

## Default fallback logo

The committed fallback logo image uses this exact filename:

```text
brain-stormy-logo.svg
```

Vite serves files in `public` from the configured app base path, so reference these files with `import.meta.env.BASE_URL` in React components.

## Pull-request friendly format

Keep committed logo artwork as SVG so PRs stay text-only. Binary logo files are ignored by the repository-level `.gitignore` and should be converted to SVG before opening a PR.
