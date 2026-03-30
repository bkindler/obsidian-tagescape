# Tagescape

An Obsidian plugin that suppresses inline tag recognition in body text. Only tags defined in frontmatter properties are kept.

## What it does

By default, Obsidian treats any `#word` in your note body as a tag. This plugin disables that behavior:

- **Inline tags** (`#example` in body text) are treated as plain text — no tag styling, no click behavior, and they are excluded from the tag pane and tag search.
- **Frontmatter tags** (defined in YAML properties) continue to work normally.

## Why

If you use tags exclusively in frontmatter properties for organization, inline `#` symbols (e.g. in headings references, issue numbers, or casual notes) can pollute your tag list. Tagescape keeps your tag namespace clean.

## Installation

### From Obsidian Community Plugins

1. Open **Settings → Community plugins → Browse**
2. Search for **Tagescape**
3. Click **Install**, then **Enable**

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/bjoernkindler/obsidian-tagescape/releases/latest)
2. Create a folder `tagescape` in your vault's `.obsidian/plugins/` directory
3. Place the downloaded files into that folder
4. Enable the plugin in **Settings → Community plugins**
