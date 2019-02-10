var commands = {};
var filesystem = root = new FilesystemObject("/","directory","755","root","root", 
	Date.parse('04 Feb 2018 22:22:22 GMT'));
filesystem.content["home"] = 
	new FilesystemObject("home","directory","755","root","root", 
	Date.parse('04 Feb 2018 22:23:01 GMT'),filesystem);
var workingDirectory = homeDirectory = 
	filesystem.content["home"].content["jetroid"] =
	new FilesystemObject("jetroid","directory","755","jetroid","users",
	new Date(),filesystem.content["home"]);
blogposts.content[".."] = homeDirectory;
homeDirectory.content["blog"] = blogposts;

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


var printUnsafe = function(text) {
	var container = document.createElement("p");
	container.innerHTML = text;
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
	var splitTyped = userTyped.trim().split(" ");
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

var pathToObject = function(pathStr) {
	// remove a trailing slash because that breaks things
	if (pathStr.endsWith("/")) {
		pathStr = pathStr.slice(0,-1);
	}  
	// navigate the path left to right to find the object
	var pathSegments = pathStr.split("/");
	var path;

	// determine where to start looking from
	var firstSegment = pathSegments.shift();
	if (firstSegment === "") {
		// path like /home/jetroid/blog
		path = filesystem;
	} else if (firstSegment === "~") {
		// path like ~/blog
		path = homeDirectory;
	} else {
		// path like ./blog or ../blog or blog 
		if (firstSegment in workingDirectory.content) {
			path = workingDirectory.content[firstSegment];
		} else {
			// Couldn't find path
			return 1;
		}
	}

	for (var i = 0; i < pathSegments.length; i++) {
		var segment = pathSegments[i];
		if (path["type"] === "directory" && segment in path.content) {
			path = path.content[segment];
		} else {
			return 1;
		}
	}

	return path;
}

var objectToPath = function(object) {
	var string = "";
	while (object !== filesystem && object !== homeDirectory) {
		string = "/" + object.name + string;
		object = object.content[".."];
		console.log(object);
	}
	if (object === homeDirectory) {
		return "~" + string;
	} else {
		return string || "/";
	}
}

var setWorkingDirectory = function(pathObject) {
	document.getElementById("path").textContent = objectToPath(pathObject);
	workingDirectory = pathObject;
}

var determineCommand = function(command) {
	return commands[command];
}

commands.echo = function(input) {
	print(input);
	return 0;
}

commands.ls = function(input) {
	if (input.length === 0) {
		var directoryContents = Object.keys(workingDirectory.content);
		var lsStr = "";
		for (var i = 0; i < directoryContents.length; i++) {
			var name = directoryContents[i];
			var meta = workingDirectory.content[name];
			if (meta["type"] === "directory") {
				lsStr += "<span class='nowrap lsdir'>" + name + "</span> ";
			} else {
				lsStr += "<span class='nowrap lsblue'>" + name + "</span> ";
			}
		}
		printUnsafe(lsStr);
		return 0;
	} else {
		//TODO: Other cases and parameters
	}
}

commands.cd = function(input) {
	if (input.length === 0) {
		// if no path give, we go home
		setWorkingDirectory(homeDirectory);
	} else if (input.length === 1) {
		// if no parameters given,
		var path = pathToObject(input[0]);
		if (path === 1) {
			print("cd: no such file or directory: " + input[0]);
			return 1;
		} else if (path.type === "file") {
			print("cd: not a directory: " + input[0]);
			return 1;
		} else {
			setWorkingDirectory(path);
			return 0;
		}
	} else {
		//TODO: Other cases and parameters
		print("cd: too many arguments");
		return 1;
	}
}

commands.wget = function(input) {
	for (var i = 0; i < input.length; i++) {
		var string = input[i];
		if (!(string.startsWith("http://") 
			|| string.startsWith("https://") 
			|| string.startsWith("ftp://"))) {
			string = "http://" + string;
		}
		urlregex = /((http|ftp|https):\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}$/g;
		if (urlregex.test(string)) {
			string = string + "/"
		}
		print("--"+getDateStamp()+" "+getTimeStamp()+"  "+string);
		var xhr = new XMLHttpRequest();
		xhr.open("GET", 'https://jetroidcors.herokuapp.com/' + string, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
				//Everything successful and OK
				var filename = string.split("/").pop();
				filename = filename.length === 0 ? "index.html" : filename;
				if (pathToObject(filename) !== 1) {
					filename = filename + ".1";
					var int = 1;
					while(pathToObject(filename) === 1) {
						filename = filename.slice(0,-(int.toString().length)) + int++;
					}
				}
				var file = new FilesystemObject("filename","file","755","jetroid","users");
				file.content = xhr.responseText;
				workingDirectory.content[filename] = file;
			} else if(xhr.readyState == XMLHttpRequest.DONE) {
				//Some kind of network error
			}
		}
		xhr.send(null);
	}
}

commands.cat = function(input) {
	for (var i = 0; i < input.length; i++) {
		var file = pathToObject(input[i]);
		print(file.content);
	}
}

var getDateStamp = function(time, delim, yearLast) {
	time = time || new Date();
	delim = delim || "-";
	var day = time.getDate();
	day = day < 10 ? "0" + day : day; 
	var month = time.getMonth()+1;
	month = month < 10 ? "0" + month : month;
	var year = time.getFullYear();
	if (yearLast) {
		return day + delim + month + delim + year;
	} else {
		return year + delim + month + delim + day;
	}
}

var getTimeStamp = function(time, delim) {
	time = time || new Date();
	delim = delim || ":";
	var hour = time.getHours();
	hour = hour < 10 ? "0" + hour : hour; 
	var minute = time.getMinutes();
	minute = minute < 10 ? "0" + minute : minute;
	var second = time.getSeconds(); 
	second = second < 10 ? "0" + second : second;
	return hour + delim + minute + delim + second;
}

var setTime = function() {
	var str = getTimeStamp();
	document.getElementById("time").textContent = str;
	window.setTimeout(setTime,500);
}

window.onload = function () {
	setTime();
}