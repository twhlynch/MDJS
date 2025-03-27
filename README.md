# mdjs

A lightweight (bare minimum) Markdown to HTML parser in JavaScript.

Supports loading .md files from URLs or as a string with most basic syntax working, and reads custom metadata from the top of the markdown file if given.

Currently does not support:
- Nested bold and italic (well)
- Nested lists
- Tables
- LaTeX
- Code highlighting

## Usage
An example is provided in `/example`, and live on pages.

```html
<link rel="stylesheet" href="path/to/mdjs.css">
<script src="path/to/mdjs.js" defer></script>
```

```javascript
const parser = new MarkdownParser();
await parser.loadMarkdownFromURL("example.md");
console.log(parser.getMarkdown());
console.log(parser.getMetadata());
```

## Caution
Only code blocks are escaped so be aware of loading unsanitized markdown files.

## Issues
Currently seems to have an issue with inline code followed by a space: `example` will cause the rest of the markup to be code