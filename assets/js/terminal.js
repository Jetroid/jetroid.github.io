var enterPressed = function() {
	// hide the prompt (needs to be hidden whilst  commands are executing)
	var prompt = document.getElementById("prompt");
	prompt.style.display = "none";

	// create a simple copy of the current state of the prompt
	// and write it to the history.
	var oldTime = document.getElementById("time").textContent;
	var oldError = document.getElementById("error-code").textContent;
	var oldPath = document.getElementById("path").textContent;
	//TODO: REPLACE THIS ONCE PROMPT INPUT HAS CHANGED
	var userTyped = document.getElementById("data").value;

	// add the prompt to the 'output history'
	print(oldTime + " jetroid@netricsa:" + oldError + oldPath + " " + userTyped);
}

var enablePrompt = function(errorCode) {
	var prompt = document.getElementById("prompt");
	prompt.style.display = "block";
	document.getElementById("error-code").textContent = errorCode;
}

var print = function(text) {
	var container = document.createElement("p");
	container.textContent = text;
	var history = document.getElementById("history");
	history.appendChild(container);
}
