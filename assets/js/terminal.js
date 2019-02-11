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

var scrollToBottom = function() {
	var element = document.getElementById("terminal-container");
	element.scrollTop = element.scrollHeight;
}

//Generate an Int between lower (inclusive) and upper (exclusive)
var generateRandomInt = function(lower, upper){
	return Math.floor(Math.random()*((upper-1)-lower+1)+lower);
}

var enablePrompt = function(errorCode) {
	//TEMPORARY
	errorCode = errorCode === undefined ? "ERROR CODE NOT SET": errorCode;

	var prompt = document.getElementById("prompt");
	prompt.style.display = "block";
	document.getElementById("error-code").textContent = errorCode;
	//TODO: REPLACE THIS ONCE PROMPT INPUT HAS CHANGED
	document.getElementById("data").value = "";
}

var print = function(text, append) {
	var history = document.getElementById("history");
	if (!append) {
		var container = document.createElement("p");
		container.textContent = text;
		history.appendChild(container);
	} else {
		var container = history.lastChild;
		container.innerHTML += htmlEntities(text);
	}
}

var printUnsafe = function(text, append) {
	var history = document.getElementById("history");
	if (!append) {
		var container = document.createElement("p");
		container.innerHTML = text;
		history.appendChild(container);
	} else {
		var container = history.lastChild;
		container.innerHTML += text;
	}
}

var htmlEntities = function(str) {
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
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
	printUnsafe("<span class='pink'>" + oldTime + " jetroid@netricsa</span>:" + oldError + oldPath + "$ " + userTyped);

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
		command(splitTyped);
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

	// navigate from the starting point and resolve the rest of the path
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

var makeXHRRequest = function(url, onSuccess, onError) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'https://jetroidcors.herokuapp.com/' + url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status == 200) {
			//Everything successful and OK
			var contentType = xhr.getResponseHeader("Content-Type");
			onSuccess(xhr.responseText, contentType);
		} else if(xhr.readyState === XMLHttpRequest.DONE) {
			onError(xhr.status, xhr.statusText);
		}
	};
	xhr.send(null);
}

var determineCommand = function(command) {
	return commands[command];
}

commands.echo = function(input) {
	print(input);
	enablePrompt(0);
}

commands.ls = function(input) {
	if (input.length === 0) {
		var directoryContents = Object.keys(workingDirectory.content);
		for (var i = 0; i < directoryContents.length; i++) {
			var name = directoryContents[i];
			if (name === "." || name === "..") continue;
			var meta = workingDirectory.content[name];
			if (meta["type"] === "directory") {
				printUnsafe("<span class='nowrap lsdir'>" + htmlEntities(name) + "</span>");
			} else {
				printUnsafe("<span class='nowrap lsblue'>" + htmlEntities(name) + "</span>");
			}
		}
		enablePrompt(0);
	} else {
		//TODO: Other cases and parameters
	}
}

commands.cd = function(input) {
	if (input.length === 0) {
		// if no path given, we go home
		setWorkingDirectory(homeDirectory);
		enablePrompt(0);
	} else if (input.length === 1) {
		// if no parameters given,
		var path = pathToObject(input[0]);
		if (path === 1) {
			print("cd: no such file or directory: " + input[0]);
			enablePrompt(1);
		} else if (path.type === "file") {
			print("cd: not a directory: " + input[0]);
			enablePrompt(1);
		} else {
			setWorkingDirectory(path);
			enablePrompt(0);
		}
	} else {
		//TODO: Other cases and parameters
		print("cd: too many arguments");
		enablePrompt(1);
	}
}

commands.wget = function(input, startTime, countRuns, totalChars, totalFakeDownloadTime) {
	var fakeSpeed = (Math.random() * (12.67 - 3.2) + 3.2).toFixed(2);
	if (input.length === 0 && countRuns > 1) {
		// generate the "FINISHED" stats stuff when wget'ing multiple urls
		print("FINISHED --"+getDateStamp()+" "+getTimeStamp()+"--");
		
		var totalTimeDifference = Math.abs(startTime.getTime() - new Date().getTime());
		var ms = totalTimeDifference % 1000;
		var secs = ((totalTimeDifference - ms) / 1000) % 60;
		print("Total wall clock time: "+secs+"."+ms+"s");
		
		var kb = totalChars.toString().slice(0,-3);
		var downloadTime = totalFakeDownloadTime.toFixed(3);
		print("Downloaded: "+countRuns+" files, "+kb+"K in "+downloadTime+"s ("+fakeSpeed+" MB/s)");
		enablePrompt(0);
	} else if (input.length === 0 && countRuns === 1) {
		// don't print anything when finished wget'ing a single url
		enablePrompt(0);
	} else if (input.length === 0) {
		// if we didn't specify a url we print an error
		print("wget: missing URL");
		enablePrompt(1);
	} else {
		// we still have urls to get

		// set some defaults to the parameters
		startTime = startTime || new Date() 
		countRuns = countRuns || 0;
		totalChars = totalChars || 0;
		totalFakeDownloadTime = totalFakeDownloadTime || 0;

		var string = input.shift();
		if (!(string.startsWith("http://") 
			|| string.startsWith("https://") 
			|| string.startsWith("ftp://"))) {
			string = "http://" + string;
		}
		urlregex = /((http|ftp|https):\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}$/g;
		if (urlregex.test(string)) {
			string = string + "/"
		}
		var onSuccess = function(text, type) {
			// get just the file name, if there is one
			var filename = string.split("/").pop();
			// If not filename specified, resort to index.html
			filename = filename.length === 0 ? "index.html" : filename;
			// if filename is taken, keep appending numbers until we find one
			if (pathToObject(filename) !== 1) {
				filename = filename + ".1";
				var int = 1;
				while(pathToObject(filename) !== 1) {
					console.log(filename + " is taken");
					filename = filename.slice(0,-(int.toString().length)) + int++;
				}
			}
			var file = new FilesystemObject(filename,"file","755","jetroid","users");
			file.content = text;
			workingDirectory.content[filename] = file;
			print(" 104.27.162.119, 104.27.163.119, 2606:4700:30::681b:a377, ...",true);
			window.setTimeout(function(){
				print("Connecting to "+string+" ("+string+")|104.27.162.119|:80...");
				window.setTimeout(function(){
					print(" connected.",true);
					print("HTTP request sent, awaiting response...");
					window.setTimeout(function(){
						var fakeTime = (Math.random() * (0.010 - 0.001) + 0.001).toFixed(3);
						var bytes = text.length;
						print(" 200 OK",true);
						print("Length: unspecified [" + type + "]");
						print("Saving to: ‘"+filename+"’");
						print("​");
						printUnsafe("<pre style='display:inline;'>" +filename + "              [ &lt;=&gt; </pre><pre class='hugright'>]  "+bytes+"  --.-KB/s    in "+fakeTime+"s   </pre>");
						print("​");
						print(getDateStamp()+" "+getTimeStamp() + " ("+fakeSpeed+" MB/s) - ‘"+filename+"’ saved ["+bytes+"]");
						print("​");
						commands.wget(input, startTime, countRuns+1, totalChars+bytes, totalFakeDownloadTime+parseFloat(fakeTime));
					},100+generateRandomInt(0,50));
				},75+generateRandomInt(0,50));
			},125+generateRandomInt(0,50));
		}
		var onError = function(status, text) {
			//TODO....
		}
		print("--"+getDateStamp()+"-- "+getTimeStamp()+"  "+string);
		print("Resolving "+string+" ("+string+")...");
		makeXHRRequest(string,onSuccess,onError);
	}
}

commands.cat = function(input) {
	for (var i = 0; i < input.length; i++) {
		var object = pathToObject(input[i]);
		if (object === 1) {
			print("cat: "+ input[1] + ": No such file or directory");
			enablePrompt(1);
		} else if (object.type === "directory") {
			print("cat: "+ input[1] + ": Is a directory");
			enablePrompt(1);
		} else {
			if (object.content.startsWith("blogurl(")) {

			} else if (object.content.startsWith("url(")) {

			} else {
				print(object.content);
			}
			enablePrompt(0);
		}
	}
}

commands.shutdown = function(input) {
	var shutdown = function(){
		var shutdownLines = [
			"Broadcast message from jetroid@netricsa",
			"(/dev/pts/0) at " + getDateStamp() + " ...",
			"​",
			"The system is going down for maintenance NOW!",
			"<span>[root@netricsa ~]# Stopping httpd:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping sshd:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping crond:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Shutting down wpa_supplicant:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping giving-a-damn:</span><pre class='hugright'>[  FAILED  ]</pre>",
			"<span>[root@netricsa ~]# Stopping daydreaming:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping waiting_for_love:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping trying-to-fit-in:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping blaming#others:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping time:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping keylogger:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping wasting-time:</span><pre class='hugright'>[  FAILED  ]</pre>",
			"<span>[root@netricsa ~]# Stopping smoking:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping drinking:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Stopping overeating:</span><pre class='hugright'>[  FAILED  ]</pre>",
			"<span>[root@netricsa ~]# Stopping typing:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Shutting down the-us-government:</span><pre class='hugright'>[  OK  ]</pre>",
			"<span>[root@netricsa ~]# Shutting down emotionally:</span><pre class='hugright'>[  OK  ]</pre>",
			"Shutting down.",
			"systemd-shutdown[1]: Syncing filesystems and block devices.",
			"systemd-shutdown[1]: Sending SIGTERM to remaining processes..."
		];
		document.getElementById("terminal-container").style.display="none";
		var shutdownContainer = document.getElementById("shutdown-container");
		shutdownContainer.style.display = "block";

		var getNextPrint = function(nextFunction,counter) {
			var randomDelay = generateRandomInt(50,100);
			if(counter === 4) {
				// extra delay for the broadcast
				randomDelay += 3000;
			}
			return function(){
				setTimeout(function() {
					var p = document.createElement("p");
					p.innerHTML = shutdownLines[counter];
					shutdownContainer.appendChild(p);
					nextFunction();
				},randomDelay);
			};
		};

		var nextFunction = function() {
			shutdownContainer.style.display = "none";
			document.body.className = "off";
		};
		
		for(var i = shutdownLines.length-1; i >= 0 ; i--) {
			nextFunction = getNextPrint(nextFunction, i);
		}
		nextFunction();

	};
	if (input[0] === "now"){
		shutdown();
	} else {
		var delaySeconds = parseInt(input[0]);
		setTimeout(shutdown,delaySeconds*1000);
		enablePrompt(0);
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
	printUnsafe("<pre> __________     <==^==>___    /^^^\\  /```````/````\\</pre>");
	printUnsafe("<pre><____  ----'/```\\ | | |___\\\\  \\/^\\ \\ |_/| |`` |/``\\\\</pre>");
	printUnsafe("<pre>     | |   | |``` | | ||  ||`  `  \\ |   | |   ||  ||</pre>");
	printUnsafe("<pre>     |j|   &gt;e==== |t| |r- //  /o\\ | |   i |   d|  //</pre>");
	printUnsafe("<pre>     | |   | |___ | | || \\\\   | \\_/ / __/ |__ || //</pre>");
	printUnsafe("<pre> /^--` /   \\____/ \\v/ |\\. \\\\. \\____/  \\_____/ <__/</pre>");
	printUnsafe("<pre> ``````   _____--------```````````````````></pre>");
	printUnsafe("<pre>          \\_____/------/``````````````\\--/</pre>");
	print("​");
	printUnsafe("<pre>             ###########################</pre>");
	printUnsafe("<pre>            ###  WELCOME TO NETRICSA  ###</pre>")
	printUnsafe("<pre>            ### ALL ACCESS IS LOGGED! ###</pre>");
	printUnsafe("<pre>             ###########################</pre>");
	enablePrompt(0);
}