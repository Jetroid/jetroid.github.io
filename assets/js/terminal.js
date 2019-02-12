// SETUP THE FILESYSTEM AND USERS
// the root /
var filesystem = new FilesystemObject("/","directory","755","root","root", 
	new Date(Date.parse('04 Feb 2018 22:22:22 GMT')));
// the /home folder
filesystem.content["home"] = 
	new FilesystemObject("home","directory","755","root","root", 
	new Date(Date.parse('04 Feb 2018 22:23:01 GMT')),filesystem);
// jetroid's home directory
filesystem.content["home"].content["jetroid"] =
	new FilesystemObject("jetroid","directory","755","jetroid","users",
	new Date(),filesystem.content["home"]);
// root's home directory, /root
filesystem.content["root"] = new FilesystemObject("root","directory","750","root","root",
	new Date(Date.parse('21 Jan 2019 16:51:08 GMT')),filesystem);

var User = function(name,isSuperUser,groups,homeDirectory) {
	this.name = name;
	this.isSuperUser = isSuperUser;
	this.groups = groups;
	this.homeDirectory = homeDirectory;
};

var users = {
	"root": new User("root",true,["root"],filesystem.content["root"],),
	"jetroid": new User("jetroid",false,["users"],filesystem.content["home"].content["jetroid"]) 
}
var groups = ["root","users"];
// add my blogposts to my home directory
blogposts.content[".."] = users["jetroid"].homeDirectory;
users["jetroid"].homeDirectory.content["blog"] = blogposts;

var currentUser = users["jetroid"];
var workingDirectory = currentUser.homeDirectory;
var suStack = [];
var isSudo = false;
var commandHistory = [];
var login = new Date();

// DONE SETUP OF FILESYSTEM AND USERS

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
	scrollToBottom();
	// disable sudo afterwards
	isSudo = false;
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
	scrollToBottom();
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
	scrollToBottom();
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

	// add the command to command history
	commandHistory.push(userTyped);

	// add the prompt to the 'output history'
	printUnsafe("<span class='pink'>" + oldTime + " "+currentUser.name+"@netricsa</span>:" + oldError + oldPath + "$ " + userTyped);

	// determine the command the user typed and execute it
	var splitTyped = userTyped.trim().split(" ");
	determineCommand(splitTyped);
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
		path = currentUser.homeDirectory;
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
	while (object !== filesystem && object !== currentUser.homeDirectory) {
		string = "/" + object.name + string;
		object = object.content[".."];
		console.log(object);
	}
	if (object === currentUser.homeDirectory) {
		return "~" + string;
	} else {
		return string || "/";
	}
}

var checkOctalPermission = function(octalInput) {
	var octal = octalInput;
	if (typeof octalInput === "string") {
		octal = parseInt(octalInput);
	}
	// Easier and simpler than some hard to read math
	switch(octal) {
		case 7:
			return [true, true, true];
		case 6:
			return [true, true, false];
		case 5:
			return [true, false, true];
		case 4:
			return [true, false, false];
		case 3:
			return [false, true, true];
		case 2:
			return [false, true, false];
		case 1:
			return [false, false, true];
		case 0: 
			return [false, false, false];
		default:
			console.log("Using checkOctalPermission incorrectly");
			return [false, false, false]; 
	}
}

var havePermission = function(object, permission) {
	var checkPermission = function(octal, permission) {
		var permissions = checkOctalPermission(octal);
		if (permission === "read" || permission === "r") {
			return permissions[0];
		} else if (permission === "write" || permission === "w") {
			return permissions[1];
		} else if (permission === "execute" || permission === "x") {
			return permissions[2];
		} else {
			return false;
		}
	}

	if (object.owner === currentUser.name) {
		checkPermission(object, permission);
	} else if (currentUser.groups.includes(object.group)) {
		checkPermission(object, permission);
	} else {
		checkPermission(object, permission);
	}
}

var convertOctalPermissions = function(octalPermissions) {
	var string = "";
	for (var i = 0; i < octalPermissions.length; i++) {
		var permission = checkOctalPermission(octalPermissions[i]);
		string += permission[0] ? "r" : "-";
		string += permission[1] ? "w" : "-";
		string += permission[2] ? "x" : "-";
	}
	return string;
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

var fakeCorruption = function() {
	return "";
}

var changeUser = function(user) {
	currentUser = user;
	document.getElementById("user").textContent = user.name;
}

var determineCommand = function(input,bangDepth) {
	bangDepth = bangDepth || 2;
	var commandPart = input.shift();
	var command = commands[commandPart];

	if (commandPart === "!!" && commandHistory.length >= bangDepth) {
		determineCommand(commandHistory[commandHistory.length-bangDepth].trim().split(" "),bangDepth+1);
	} else if (commandPart === "!!") {
		print("zsh: no such event: 0");
		enablePrompt(1);
	} else if (command === undefined) {
		//User didn't type a valid command
		print("zsh: command not found: " + userTyped);
		enablePrompt(127);
	} else {
		//execute command on input
		command(input);
	}
}

var commands = {};

commands.echo = function(input) {
	print(input);
	enablePrompt(0);
}

// primitive ls that only supports `-al`
commands.ls = function(input) {
	var ls = function(directories, isAll, isLong, returnValue) {
		for (var i = 0; i < directories.length; i++) {
			var directory = directories[i];
			if (directories.length > 1) {
				print(directory.name+ ":");
			}
			var directoryContents = Object.keys(directory.content);
			
			var nameLength = 0;
			var ownerLength = 0;
			var groupLength = 0;
			// loop once to determine pad
			for (var k = 0; k < directoryContents.length; k++) {
				if (!isAll && (name === "." || name === "..")) continue;
				var object = directory.content[directoryContents[k]];
				nameLength = Math.max(nameLength, directoryContents[k].length);
				ownerLength = Math.max(ownerLength, object.owner.length);
				groupLength = Math.max(groupLength, object.group.length);
			}
			// actually output this time
			var notLongString = "";
			for (var j = 0; j < directoryContents.length; j++) {
				var name = directoryContents[j];
				var object = directory.content[name];
				
				// ignore . and .. unless -a
				if (!isAll && (name === "." || name === "..")) continue;

				// make directories blue
				var blueClass = object["type"] === "directory" ? " lsdir" : "";
				// if -l, one line per entry, otherwise keep appending
				if (isLong) {
					printUnsafe("<pre> "+convertOctalPermissions(object.protections)+
					" 1 "+
					object.owner.padEnd(ownerLength)+" "+
					object.group.padEnd(groupLength)+" "+
					generateRandomInt(111111,880000)+" "+getDateStamp(object.date,":",true) +"  "+
					"<span class='"+blueClass+"'>" + htmlEntities(name.padEnd(nameLength)) + "</span></pre>");
				} else {
					notLongString += "<pre class='ls"+blueClass+"'> " + htmlEntities(name.padEnd(nameLength)) + "</pre> ";
				}
			}
			//if not -l, we print all at once after appending a bunch.
			if (!isLong) printUnsafe(notLongString);
		}
		enablePrompt(returnValue);
	}
	if (input.length === 0) {
		ls([workingDirectory], false, false, 0);
	} else {
		var isAll = false;
		var isLong = false;
		var directories = [];
		var returnValue = 0;
		for (var i = 0; i < input.length; i++) {
			var chunk = input[i];
			var doubleTack = /^--.*/;
			var singleTack = /^-/;
			if (doubleTack.test(chunk)){
				if (chunk === "--all") isAll = true;
			} else if (singleTack.test(chunk)) {
				if (chunk.includes("l")) isLong = true;
				if (chunk.includes("a")) isAll = true;
			} else {
				var object = pathToObject(chunk);
				if (object === 1) {
					print("ls: cannot access '"+chunk+"': No such file or directory");
					returnValue = 1;
				} else {
					directories.push(object);
				}
			}
		}
		if (directories.length === 0) directories.push(workingDirectory);
		ls(directories, isAll, isLong, returnValue);
	}
}

commands.cd = function(input) {
	if (input.length === 0) {
		// if no path given, we go home
		setWorkingDirectory(currentUser.homeDirectory);
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

commands.wget = function(input, startTime, countRuns, totalChars, totalFakeDownloadTime, errorCode) {
	var fakeSpeed = (Math.random() * (12.67 - 3.2) + 3.2).toFixed(2);
	var errorCode = errorCode || 0;
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
		enablePrompt(errorCode);
	} else if (input.length === 0 && countRuns === 1) {
		// don't print anything when finished wget'ing a single url
		enablePrompt(errorCode);
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

		// convert what our typed into a couple variations that wget uses 
		var userString = input.shift();
		var protocolRegex = /(^\w+:|^)\/\/.*/;
		var protocolString = userString;
		if (!protocolRegex.test(protocolString)) {
			protocolString = "http://" + userString;
		}

		// try to append a slash if no path given
		urlregex = /((http|ftp|https):\/\/)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}$/g;
		if (urlregex.test(protocolString)) {
			protocolString += "/";
		}
		// regex to just capture the domain
		var urlregex2 = /(?:http|ftp|https):\/\/([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)(?:[-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		var domainString = urlregex2.exec(protocolString)[1];
		var onSuccess = function(text, type) {
			// get just the file name, if there is one
			var filename = protocolString.split("/").pop();
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
			var file = new FilesystemObject(filename,"file","755",currentUser.name,"users");
			file.content = text;
			workingDirectory.content[filename] = file;
			print(" 104.27.162.119, 104.27.163.119, 2606:4700:30::681b:a377, ...",true);
			window.setTimeout(function(){
				print("Connecting to "+domainString+" ("+domainString+")|104.27.162.119|:80...");
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
						commands.wget(input, startTime, countRuns+1, totalChars+bytes, totalFakeDownloadTime+parseFloat(fakeTime), errorCode);
					},100+generateRandomInt(0,50));
				},75+generateRandomInt(0,50));
			},125+generateRandomInt(0,50));
		}
		var onError = function(status, text) {
			console.log(status);
			console.log(text);
			print(" failed: Name or service not known.",true);
			print("wget: unable to resolve host address ‘fakesite.htmp’");
			commands.wget(input, startTime, countRuns+1, totalChars, totalFakeDownloadTime, 1)
		}
		print("--"+getDateStamp()+"-- "+getTimeStamp()+"  "+protocolString);
		print("Resolving "+domainString+" ("+domainString+")...");
		var noProtocolString = userString.replace(/(^\w+:|^)\/\//, '');
		makeXHRRequest(noProtocolString,onSuccess,onError);
	}
}

commands.cat = function(input, countRuns, errorCode) {
	errorCode = errorCode || 0;
	countRuns = countRuns || 1;
	if (input.length === 0 && countRuns > 1) {
		// We've cat'ed everything, done.
		enablePrompt(0);
	} else if (input.length === 0) {
		// if we didn't specify a file we print an error
		print("cat: no file specified");
		enablePrompt(1);
	} else {
		// try to cat the thing
		var string = input.shift();
		var object = pathToObject(string);
		if (object === 1) {
			print("cat: "+ input[1] + ": No such file or directory");
			enablePrompt(1);
		} else if (object.type === "directory") {
			print("cat: "+ input[1] + ": Is a directory");
			enablePrompt(1);
		} else {
			var content = object.content;
			if (content.startsWith("blogurl(")) {
				var url = content.slice(8,-1);
				var onSuccess = function(text, mime) {
					print(text);
					commands.cat(input,countRuns+1)
				};
				var onError = function(status, text) {
					print(fakeCorruption());
					commands.cat(input,countRuns+1)
				}
				makeXHRRequest("jetholt.com/" + url, onSuccess, onError);
			} else {
				print(content);
				commands.cat(input,countRuns+1)
			}
		}
	}
}

commands.chown = function(input) {
	var userGroup = input[0].split(":");
	var user = userGroup[0];
	var group = userGroup[1];
	var file = input[1];

	if (users[user] === undefined) {
		print("chown: invalid user: ‘"+user+"’");
		enablePrompt(1);
	} else if (group !== undefined && !(groups.includes(group))) {
		print("chown: invalid group: ‘"+group+"’");
		enablePrompt(1);
	} else if (pathToObject(file) === 1) {
		print("chown: cannot access '"+file+"': No such file or directory");
		enablePrompt(1);
	} else if (currentUser.isSuperUser || isSudo) {
		var fileObject = pathToObject(file);
		fileObject.owner = user;
		if (group !== undefined) {
			fileObject.group = group;
		}
		enablePrompt(0);
	} else {
		print("chown: changing ownership of '"+file+"': Operation not permitted");
		enablePrompt(1);
	}
}

commands.chgrp = function(input) {
	var group = input[0];
	var file = input[1];

	if (group !== undefined && !(groups.includes(group))) {
		print("chgrp: invalid group: ‘"+group+"’");
		enablePrompt(1);
	} else if (pathToObject(file) === 1) {
		print("chgrp: cannot access '"+file+"': No such file or directory");
		enablePrompt(1);
	} else if (currentUser.isSuperUser || isSudo) {
		var fileObject = pathToObject(file);
		fileObject.group = group;
		enablePrompt(0);
	} else {
		print("chgrp: changing ownership of '"+file+"': Operation not permitted");
		enablePrompt(1);
	}
}

commands.su = function(input) {
	if (input.length === 0) {
		print("su: no user specified");
		enablePrompt(1);
	} else if (users[input[0]] === undefined) {
		print("su: user " + input[0] + " does not exist");
		enablePrompt(1);
	} else {
		suStack.push(currentUser);
		changeUser(users[input[0]]);
		enablePrompt(0);
	}
}

commands.sudo = function(input) {
	isSudo = true;
	determineCommand(input);
}

commands.groups = function(input) {
	var user = input[0];
	if (user !== undefined) {
		var userObject = users[user];
		if (userObject !== undefined) {
			print(userObject.groups);
			enablePrompt(0);
		} else {
			print("groups: unknown user " + user);
			enablePrompt(1);
		}
	} else {
		print(currentUser.groups);
		enablePrompt(0);
	}
}

commands.who = function(input) {
	if (input.length === 0) {
		printUnsafe("<pre>jetroid  tty1         2019-01-30 13:06</pre>");
		printUnsafe("<pre>jetroid  pts0         "+getDateStamp()+" "+getTimeStamp(new Date(),":",true)+"</pre>");
	}
	//TODO OTHER CASES
	enablePrompt(0)
}

commands.whoami = function(input) {
	print(currentUser.name);
	enablePrompt(0);
}

var logout = function() {
	document.body.className = "off";
	document.getElementById("container").style.display = "none";
}

commands.logout = function(input) {
	logout();
}

commands.exit = function(input) {
	if (suStack.length > 0) {
		var user = suStack.pop();
		changeUser(user);
		enablePrompt(0);
	} else {
		logout();
	}
}

commands.shutdown = function(input) {
	var shutdown = function(){
		var shutdownLines = [
			"Broadcast message from "+currentUser.name+"@netricsa",
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

		var nextFunction = logout;
		
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

var getDateStamp = function(time, delim, altFormat) {
	time = time || new Date();
	console.log(time);
	delim = delim || "-";
	var day = time.getDate();
	day = day < 10 ? "0" + day : day;
	var altDay = time.getDate() < 10 ? " " + time.getDate() : time.getDate();
	var month = time.getMonth()+1;
	month = month < 10 ? "0" + month : month;
	var year = time.getFullYear();
	var months3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	if (altFormat) {
		var currentTime = new Date();
		var col3 = currentTime.getFullYear() !== year ? " " + year : getTimeStamp(time, ":", true);
		return months3[time.getMonth()] + " " + altDay + " " + col3;
	} else {
		return year + delim + month + delim + day;
	}
}

var getTimeStamp = function(time, delim, noSeconds) {
	time = time || new Date();
	delim = delim || ":";
	var hour = time.getHours();
	hour = hour < 10 ? "0" + hour : hour; 
	var minute = time.getMinutes();
	minute = minute < 10 ? "0" + minute : minute;
	var second = time.getSeconds(); 
	second = second < 10 ? "0" + second : second;
	var ending = noSeconds ? "" : delim + second;
	return hour + delim + minute + ending;
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
	print("​");
	enablePrompt(0);
}