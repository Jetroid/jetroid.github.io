var commands = {};
var filesystem = {
	name: "/",
	type: "directory",
	protections: "755",
	owner: "root",
	group: "root",
	date: Date.parse('04 Feb 2018 22:22:22 GMT'),
	content: []
};
filesystem.content.push({
		name: "home/",
		type: "directory",
		protections: "755",
		owner: "root",
		group: "root",
		date: Date.parse('04 Feb 2018 22:23:01 GMT'),
		content: []
});
filesystem.content[0].content.push({
		name: "jetroid/",
		type: "directory",
		protections: "755",
		owner: "jetroid",
		group: "users",
		date: new Date(),
		content: []
});
filesystem.content[0].content[0].content.push(blogposts);

var enablePrompt = function(errorCode) {
	var prompt = document.getElementById("prompt");
	prompt.style.display = "block";
	document.getElementById("error-code").textContent = errorCode;
	//TODO: REPLACE THIS ONCE PROMPT INPUT HAS CHANGED
	document.getElementById("data").value = "";
}

var print = function(text) {
	var container = document.createElement("p");
	container.textContent = text;
	var history = document.getElementById("history");
	history.appendChild(container);
}

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
	print(oldTime + " jetroid@netricsa:" + oldError + oldPath + "$ " + userTyped);

	// determine the command the user typed and execute it
	var splitTyped = userTyped.split(" ");
	var commandPart = splitTyped.shift();
	var command = determineCommand(commandPart);

	if (command === undefined) {
		//User didn't type a valid command
		print("zsh: command not found: " + userTyped);
		enablePrompt(127);
	} else {
		//execute command on input
		var errorCode = command(splitTyped);
		enablePrompt(errorCode);
	}
}

var determineCommand = function(command) {
	return commands[command];
}

commands.echo = function(input) {
	print(input);
	return 0;
}

var setTime = function() {
	var time = new Date();
	var hour = time.getHours();
	hour = hour < 10 ? "0" + hour : hour; 
	var minute = time.getMinutes();
	minute = minute < 10 ? "0" + minute : minute;
	var second = time.getSeconds(); 
	second = second < 10 ? "0" + second : second;
	var str = hour + ":" + minute + ":" + second;
	document.getElementById("time").textContent = str;
	window.setTimeout(setTime,500);
}

window.onload = function () {
	setTime();
}