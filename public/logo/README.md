# Logo assets

Place the logo image here using this exact filename:

```text
brain-stormy-logo.svg
```

Vite serves files in `public` from the configured app base path, so reference this file with `import.meta.env.BASE_URL` in React components. In a root-hosted local app it resolves to:

```text
/logo/brain-stormy-logo.svg
```


## Pull-request friendly format

Keep committed logo artwork as SVG so PRs stay text-only. Binary logo files are ignored by the repository-level `.gitignore` and should be converted to SVG before opening a PR.
