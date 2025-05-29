function dragstartHandler(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
	ev.preventDefault();
	//adding dragover class if the target is the button itself
	if (ev.target.classList.contains("btn-reject")) {
		ev.target.classList.add("dragover");
	}
}

function dropHandler(ev) {
	ev.preventDefault();
	//handling drop if the target is the button itself
	if (ev.target.classList.contains("btn-reject")) {
		ev.target.classList.remove("dragover");
		createButtons();
	}
}
