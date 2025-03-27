async function loadPage(id) {
	const parser = new MarkdownParser();
	await parser.loadMarkdownFromURL(id);
	document.getElementById("content").innerHTML += parser.getHTML();
	if(document.getElementById("content").childNodes.length > 1)
	{
		document.getElementById("content").childNodes[0].style.animationName = "fade-out";
		setTimeout(() => {
			document.getElementById("content").childNodes[0].remove();
		}, 200);
	}
	document.getElementById("content").childNodes[document.getElementById("content").childNodes.length - 1].style.animationName = "fade-in";
	document.getElementById("title").innerText = parser.getMetadata().title || "Untitled";
	const urlParams = new URLSearchParams(window.location.search);
	urlParams.set('page', id);
	window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
}

async function loadPopup(id) {
	const parser = new MarkdownParser();
	await parser.loadMarkdownFromURL(id);
	const popup = document.createElement("dialog");
	popup.innerHTML = parser.getHTML();
	popup.popover = "auto";
	document.body.appendChild(popup);
	popup.showPopover();
	popup.scrollTop = 0;
	const fullButton = document.createElement("button");
	fullButton.textContent = "Full Screen";
	fullButton.className = "fullscreen-button";
	popup.appendChild(fullButton);
	fullButton.addEventListener("click", () => {
		popup.hidePopover();
		loadPage(id);
	});
	popup.addEventListener("beforetoggle", () => {
		popup.remove();
	});
}

document.getElementById("nav").childNodes.forEach(button => {
	if (button.tagName == "BUTTON") {
		button.addEventListener("click", async (e) => {
			if (button.id) {
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
					await loadPage(button.id);
				} else {
					await loadPopup(button.id);
				}
			}
		});
	}
});
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('page');
if (page && document.getElementById(page)) loadPage(page);