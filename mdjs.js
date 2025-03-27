/**
 * @author twhlynch
 */

/**
 * @description markdown to html parser
 * Currently does not support:
 * - Nested bold and italic
 * - Nested lists
 * - Tables
 * - LaTeX
 * - Code highlighting
 * @example ```
 * const parser = new MarkdownParser();
 * await parser.loadMarkdownFromURL("example.md");
 * console.log(parser.getMarkdown());
 * ```
 */
class MarkdownParser {

	#fallbackMarkdown = "# An error occurred loading the content.";
	#fallbackMetadata = {};
	#prefixHTML = `<div class="mdjs"><article>`;
	#suffixHTML = `</article></div>`;
	#rules = [
		{ regex: /```(.*?)\s*\n([\s\S]*?)```/g, html: `<code class="mdjs-code-$1"><pre>$2</pre></code>`, escape: true },
		{ regex: /```([\s\S]*?)```/g, html: `<code><pre>$1</pre></code>`, escape: true },
		{ regex: /`(.*?)`/g, html: `<code><span>$1</span></code>`, escape: true },
		{ regex: /\n-{3,}\n/g, html: `<hr>` },
		{ regex: /###### (.*?)(\n|$)/g, html: `<h6>$1</h6>` },
		{ regex: /##### (.*?)(\n|$)/g, html: `<h5>$1</h5>` },
		{ regex: /#### (.*?)(\n|$)/g, html: `<h4>$1</h4>` },
		{ regex: /### (.*?)(\n|$)/g, html: `<h3>$1</h3>` },
		{ regex: /## (.*?)(\n|$)/g, html: `<h2>$1</h2>` },
		{ regex: /# (.*?)(\n|$)/g, html: `<h1>$1</h1>` },
		{ regex: />> (.*?)(\n|$)/gm, html: `<blockquote class="mdjs-subquote">$1</blockquote>` },
		{ regex: /> (.*?)(\n|$)/gm, html: `<blockquote>$1</blockquote>` },
		{ regex: /\*\*\*(.*?)\*\*\*/g, html: `<strong><em>$1</em></strong>` },
		{ regex: /\*\*(.*?)\*\*/g, html: `<strong>$1</strong>` },
		{ regex: /\*(.*?)\*/g, html: `<em>$1</em>` },
		{ regex: /(^|\s)___(.*?)___/g, html: `$1<strong><em>$2</em></strong>` },
		{ regex: /(^|\s)__(.*?)__/g, html: `$1<strong>$2</strong>` },
		{ regex: /(^|\s)_(.*?)_/g, html: `$1<em>$2</em>` },
		{ regex: /~~(.*?)~~/g, html: `<del>$1</del>` },
		{ regex: /!\[(.*?)\]\((.*?)\)/g, html: `<img alt="$1" title="$1" src="$2">` },
		{ regex: /\[(.*?)\]\((.*?)\)/g, html: `<a href="$2">$1</a>` },
		{ regex: /^[0-9]+\.\s(.*?)(?:\n|$)/gm, html: `<li>$1</li>` },
		{ regex: /^(<li>.*?<\/li>)(?!<\/li>)/m, html: `<ol>$1` },
		{ regex: /(<li>.*?<\/li>)(?!<li>)/m, html: `$1</ol>` },
		{ regex: /^[-+*]\s(.*?)(?:\n|$)/gm, html: `<li>$1</li>` },
		{ regex: /^(<li>.*?<\/li>)(?!<\/li>)/m, html: `<ul>$1` },
		{ regex: /(<li>.*?<\/li>)(?!<li>)/m, html: `$1</ul>` },
		{ regex: /\n\n/g, html: `<br>` },
	];

	constructor() {
      this.markdown = this.#fallbackMarkdown;
		this.html = this.#prefixHTML + this.#suffixHTML;
		this.metadata = this.#fallbackMetadata;
   }

	/**
	 * @param {string} url
	 * @description load and parse markdown from a url
	 */
	async loadMarkdownFromURL(url) {
		const request = await fetch(url);
		if (request.ok) this.markdown = await request.text();
		else this.markdown = this.#fallbackMarkdown;
		this.parse();
	}

	/** 
	 * @param {string} markdown 
	 * @description load and parse markdown from a string
	 */
	loadMarkdownFromString(markdown) {
		this.markdown = markdown;
		this.parse();
	}

	/**
	 * @description parse markdown to html and metadata to json object
	 */
	parse() {
		this.extractMetadata();

		this.html = this.markdown;
		this.#rules.forEach(rule => {
			this.html = this.html.replace(rule.regex, (...args) => {
				const captures = args.slice(1, -2);

				let escapedCaptures;
				if (rule.escape) {
					escapedCaptures = captures.map(capture => {
						const text = document.createTextNode(capture);
						const span = document.createElement("span");
						span.appendChild(text);
						return span.innerHTML;
					});
				} else {
					escapedCaptures = captures;
				}

				let replacement = rule.html;
				for (let i = 0; i < captures.length; i++) {
					const placeholder = new RegExp(`\\$${i + 1}`, 'g');
					replacement = replacement.replace(placeholder, escapedCaptures[i]);
				}

				return replacement;
			});
		});

		this.html = `${this.#prefixHTML}${this.html}${this.#suffixHTML}`;
	}

	/**
    * @description extract metadata from the markdown content
    */
	extractMetadata() {
		const metadataRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/m;
      const match = this.markdown.match(metadataRegex);
      if (match) {
         const lines = match[1].trim().split("\n");
         lines.forEach(line => {
            const [key, value] = line.split(":").map(s => s.trim());
            this.metadata[key] = value;
         });
			this.markdown = this.markdown.replace(match[0], "").trim();
      } else {
         this.metadata = this.#fallbackMetadata;
      }
	}

	/** @description override default markdown for errors */
	setFallbackMarkdown(markdown) {
		this.#fallbackMarkdown = markdown;
	}

	/** @returns parsed html */
	getHTML() {
		return this.html;
	}

	/** @returns parsed metadata */
	getMetadata() {
      return this.metadata;
   }

}