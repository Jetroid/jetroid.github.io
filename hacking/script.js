//Words the user has not tried clicking on
var allWords = [];
//Words the user has tried clicking on
var words = [];
//Goal word for the minigame
var goalWord = "";
//Length of words for the minigame
var wordlength = 0;
//How many attempts we have remaining in the minigame
var attempts = 4;
//Have we had the 'replenish incorrect attempts' reward?
var hadRefresh = false;
//Set of brackets we have clicked, so we don't allow them to be clicked again
var clickedBrackets = new Set();
//Has the user been locked out?
var terminalLocked = false;
//Used as a 'loading' distraction. 
var commandPromptText = [
	{"text":"WELCOME TO ROBCO INDUSTRIES (TM) TERMLINK<br>", "isMachine":true, "delay":50},
	{"text":"<br>\>", "isMachine":true, "delay":400},
	{"text":"SET TERMINAL/INQUIRE", "isMachine":false, "delay":50},
	{"text":"<br><br>RX-9000", "isMachine":true, "delay":300},
	{"text":"<br><br>\>", "isMachine":true, "delay":200},
	{"text":"SET FILE/PROTECTION=OWNER:RWED ACCOUNTS.F", "isMachine":false, "delay":55},
	{"text":"<br><br>\>", "isMachine":true, "delay":800},
	{"text":"SET HALT RESTART/MAINT", "isMachine":false, "delay":50},
	{"text":"<br><br>Initializing RobCo Industries(TM) MF Boot Agent v2.3.0", "isMachine":true, "delay":200},
	{"text":"<br>RETROS BIOS", "isMachine":true, "delay":100},
	{"text":"<br>RBIOS-4.02.08.00 52EE5.E7.E8", "isMachine":true, "delay":150},
	{"text":"<br>Copyright 2075-2077 RobCo Ind.", "isMachine":true, "delay":200},
	{"text":"<br>Uppermem: 1024 KB", "isMachine":true, "delay":1000},
	{"text":"<br>Root (5A8)", "isMachine":true, "delay":150},
	{"text":"<br>Maintenance Mode", "isMachine":true, "delay":150},
	{"text":"<br><br>\>", "isMachine":true, "delay":150},
	{"text":"RUN DEBUG/ACCOUNTS.F", "isMachine":false, "delay":45}
];
//Prerendered left and right pointers and symbols columns 
var ptrleft = "";
var ptrright = "";
var symbolsleft = "";
var symbolsright = "";
//Boolean of if we have finished loading the words list yet
var finishedLoading = false;
var finishedPrinting = false;
var minigameBegun = false;
var targetText = "";
var currentText = "";

var tickNoise = function(){
	document.getElementById("tick").currentTime = 0;
	document.getElementById("tick").play();
};

var generateDataCorruption = function(){
	var string = "";
	var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";
	var symbols = "~#!\"$%^&*()_-+=[]{}?/,.";
	var words = ["if","it","is","can","we","space","V4ult Teg","Pos0idon Enerxy","J3tRo1d","data","0x0000","FrxquenFy C00tral","yes","no","maybe","believe","God","food","Dog","THr33","LFser RiMle","D3thclRAW","HeliDX Hne","Help Me","MissiX9ippi QuantuXo.z P3!"];
	var numsymbols = generateRandomInt(100,150);
	var count = 0;

	while(count < numsymbols) {
		count++;
		//Do we do a character or a word?
		if(generateRandomInt(0,100)<80){
			//Character
			//Do we generate a letter or a symbol?
			if (generateRandomInt(0,100)<80){
				//Character
				string += alphabet[Math.floor(Math.random() * alphabet.length)];
			} else {
				//Symbol
				string += symbols[Math.floor(Math.random() * symbols.length)];
			}
			//Bonus: Do we add a space?
			if(generateRandomInt(0,10)==1){
				string += " ";
			}
		}else{
			if(words.length > 0){
				//Which word do we add?
				wordindex = Math.floor(Math.random() * words.length);
				string += " " + words[wordindex] + " "; 
				words.splice(wordindex,1)
			}
		}
		//Bonus: Do we add a new line?
		if(generateRandomInt(0,60)==15){
			string += "<br>";
		}
	}
	string += "<br><br>FATAL ERROR: DATA CORRUPTION DETECTED. <br>PLEASE CHECK ALL CONNECTIONS.";
	return string;
};

var viewPost = function(postURL){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", postURL, true);
	xhr.onreadystatechange = function() {
		//Everything okay
		if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			var response = xhr.responseText;
			var junkElement = document.createElement("div");
			junkElement.innerHTML = response;
			postContainer = junkElement.querySelectorAll(".post-container")[0];
			var child = postContainer.firstChild;
			while((child = child.nextSibling) != null ){
				if(child.id == "post-content") break;
			}
			var postContent = child;

			document.getElementById("post-titles-container").style.display="none";
			var container = document.getElementById("post-container");
			container.style.display="block";
			container.innerHTML = postContent.innerHTML;
			fixImages();
		}
		//Network Error of some kind, display a data corruption message
		else {
			document.getElementById("post-titles-container").style.display="none";
			var container = document.getElementById("post-container");
			container.style.display="block";
			var corruptionContainer = document.createElement("p");
			corruptionContainer.innerHTML = generateDataCorruption();
			container.innerHTML = "";
			container.appendChild(corruptionContainer); 
		}
		document.getElementById("enter").play();
		resizeLoggedIn();
	}
	xhr.send(null);
}
var exitPost = function(){
	e = window.event || e;
	var element = e.target || e.srcElement;
	if(element.tagName == 'A' || element.tagName == 'a') {
		return;
	}
	document.getElementById("post-container").style.display="none";
	document.getElementById("post-titles-container").style.display="block";
	document.getElementById("enter").play();
}
var resizeLoggedIn = function(){
	var osheader = document.getElementById("os-header");
	var height = osheader.offsetHeight;
	height += parseInt(window.getComputedStyle(osheader).getPropertyValue('margin-top'));
	height += parseInt(window.getComputedStyle(osheader).getPropertyValue('margin-bottom'));
	var content = document.getElementById("blog-content");
	var height = document.body.offsetHeight - height;
	content.style.height = height + 'px';
}

var addFeedback = function(feedback){
	var feedbackContent = document.getElementById("feedback").innerHTML;
	feedbackContent = feedbackContent.replace(/^.*?<br>/, "");
	feedbackContent += feedback + "<br>";
	document.getElementById("feedback").innerHTML = feedbackContent;
}
var clearEntry = function() {
	targetText = "";
	currentText = "";
	document.getElementById("entry").innerHTML = "";
	document.getElementById("key2").play();
	document.getElementById("hack-cursor").className = "cursor-flash"
}
var textClean = function(text){
	//Replace linebreaks with nothing
	text = text.replace(/<br>/g,"");
	//Replace some tags with nothing
	text = text.replace(/<s.*?>|<\/s.*?>/g,"");
	return text;
}
var addEntryCharacter = function() {
	if(currentText === targetText || currentText.length >= targetText){
		document.getElementById("hack-cursor").className = "cursor-flash"
		return;
	}
	playKeyboardSound();
	var newText = textClean(currentText + targetText[currentText.length] + targetText[currentText.length + 1]);
	currentText = newText;
	document.getElementById("entry").textContent = newText;
	var randomDelay = generateRandomInt(0,40);
	setTimeout(addEntryCharacter,30+randomDelay);
}
var setEntry = function(span){
	var content = span.textContent;
	targetText = textClean(content);
	document.getElementById("entry").textContent = "";
	currentText = "";
	document.getElementById("hack-cursor").className = "cursor-on"
	addEntryCharacter();
}

var setAttempts = function(){
	var content = attempts + " Attempt(s) Left:";
	for (i = 0; i < attempts; i++){
		content += " ██";
	}
	document.getElementById("attemptsleft").innerHTML = content;
	if(attempts <= 1){
		document.getElementById("message").innerHTML = "!!! WARNING: LOCKOUT IMMINENT !!!";
		document.getElementById("message").className = "blinker";
	}else{
		document.getElementById("message").innerHTML = "Enter Password";
		document.getElementById("message").className = "";
	}
	if(attempts == 0){
		terminalLocked = true;
		addFeedback(">Lockout in");
		addFeedback(">progress.");
		setTimeout(function() {
			document.getElementById("locked").play();
			document.getElementById("hacking").innerHTML =
			"<p id=\"splashpage\">TERMINAL LOCKED<br><br>PLEASE CONTACT AN ADMINISTRATOR</p>";
		}, 2000);
	}
}
var clicked = function(span){
	if(terminalLocked) return;
	document.getElementById("enter").play();

	if(span.className == "word"){
		var dirtyWord = span.innerHTML.replace(/<br>/g,"");
		var word = dirtyWord.replace(/ /g,"")
		addFeedback(">" + dirtyWord);
		if (word.match(/\.+/)){
			addFeedback(">Error");
		}else if (word != goalWord){
			document.getElementById("incorrect").play();
			var correct = 0;
			for(i = 0; i < wordlength; i++){
				if(goalWord.charAt(i) == word.charAt(i)) correct++;
			}
			addFeedback(">Entry Denied");
			addFeedback(">"+ correct + "/" + wordlength + " correct.");
			attempts--;
			setAttempts();
		}else{
			terminalLocked = true;
			document.getElementById("correct").play();
			addFeedback(">Exact match!");
			addFeedback(">Please wait");
			addFeedback(">while system");
			addFeedback(">is accessed.");
			setTimeout(login, 2000);
		}
	}else if(span.className == "symbol"){
		var symbol = span.innerHTML;
		addFeedback(">" + symbol);
		addFeedback(">Error");
	}else if(span.className == "bracketpair"){
		//Display the selected item
		//We must go through each child and get it's
		//content else the <span> tags will preserve
		var children = span.children;
		var content = "";
		for(i = 0; i < children.length; i++){
			content += children[i].innerHTML;
		}
		addFeedback(">" + content);

		//Make the brackets no longer clickable
		span.removeAttribute("onclick");
		var firstChild = span.firstElementChild;
		firstChild.onclick = function(){clicked(firstChild)};
		hovercleanup();
		clickedBrackets.add(firstChild);

		//Choose between replenishing and removing dud
		if(!hadRefresh && generateRandomInt(0,10) > 7){
			//Replenish Tries
			hadRefresh = true;
			attempts = 4;
			setAttempts();
			addFeedback(">Allowance");
			addFeedback(">replenished.");
		}else{
			//Remove Dud

			//Select the dud word to remove
			var selectedWord = generateRandomInt(0, words.length);
			var dudWord = words[selectedWord];
			words.splice(selectedWord, 1);

			//Remove the dud word.
			document.getElementById(dudWord).innerHTML =
			document.getElementById(dudWord).innerHTML.replace(/[A-Z]/g,".");
			addFeedback(">Dud removed.");
		}
	}
}

//Convert a Decimal d to Hex and pad to 4 chars. Prepend with '0x'
var convertToHex = function(d){
	var hex = Number(d).toString(16).toUpperCase();
	while (hex.length < 4) {
		hex = "0" + hex;
	}
	return "0x" + hex;
}

var addBreakIfNeeded = function(string, count){
	if(count != 0 && count % 12 == 0){
		string += "<BR/>";
	}
	return string;
}

var addWord = function(string, word, count){
	//Add each letter of the word we have selected to the column
	string += "<span class='word' id=\"" + word + "\" onmouseover=\"setEntry(this)\" onclick=\"clicked(this)\">";
	for(i = 0; i < word.length; i++){
		string = addBreakIfNeeded(string, count);
		string += word.charAt(i)
		count++;
		string += " ";
		if(i+1 == word.length){
			string += "</span>";
		}
	}
	return [count, string];
}

//Generate an Int between lower (inclusive) and upper (exclusive)
var generateRandomInt = function(lower, upper){
	return Math.floor(Math.random()*((upper-1)-lower+1)+lower);
}

var playKeyboardSound = function() {
	var soundID = generateRandomInt(1,11);
	var sound = document.getElementById("key" + soundID);
	sound.currentTime = 0;
	sound.play();
}

var detectClosingBracket = function(span){
	var opening_bracket = span.innerHTML;
	var object = span;
	//Get the appropriate closing bracket
	var closing_bracket = null;
	switch(opening_bracket) {
		case "&lt; ":
		closing_bracket = "&gt; ";
		break;
		case "{ ":
		closing_bracket = "} ";
		break;
		case "[ ":
		closing_bracket = "] ";
		break;
		case "( ":
		closing_bracket = ") ";
		break;
		default:
		closing_bracket = null;
	}
	//Recursively look at next elements hoping for a closing bracket
	//If we hit a break or a letter (word), we didn't find one.

	//An array to hold the elements we looked at
	var arr = [span];
	do {
		object = object.nextElementSibling;
		arr.push(object);
		if(object.innerHTML == closing_bracket){
			//Found pair of matched brackets
			//Return array containing the nodes we visited
			return arr;
		}else if(object.className == "word"
				|| object.innerHTML == ""){
			return false;
		}
	}
	while (true);
}
var spantodelete = null;
var hovercleanup = function() {
	if(spantodelete == null){
		return;
	}
	var parent = spantodelete.parentNode;
	var ugly_children = spantodelete.childNodes;
	var pretty_children = [];

	//JavaScript doesn't have a clone feature... -_-
	//We copy to a new array to avoid changes affecting our array
	for (var i = 0; i < ugly_children.length; i++) {
		var child = ugly_children[i];
		pretty_children.push(child);
	}

	//Now we move children of newspan into the parent.
	for (var i = 0; i < pretty_children.length; i++) {
		var child = pretty_children[i];
		spantodelete.removeChild(child);
		parent.insertBefore(child, spantodelete);

	}
	parent.removeChild(spantodelete);
	spantodelete = null;
}
var hoversym = function(span) {
	setEntry(span);
	var open_regex = /&lt; |[{\[\(] /g;
	//If touch an opening bracket
	if (span.innerHTML.match(open_regex) && !clickedBrackets.has(span)){

		var returned = detectClosingBracket(span);
		var parent = span.parentNode;
		if(returned){
			span.removeAttribute("onclick");

			var newspan = document.createElement("SPAN");
			newspan.className = "bracketpair";
			newspan.onclick = function(){clicked(newspan)};
			newspan.onmouseout = function(){hovercleanup();}
			parent.insertBefore(newspan, span);
			for (var i = 0; i < returned.length; i++) {
				parent.removeChild(returned[i]);
				newspan.appendChild(returned[i]);
			}
			spantodelete = newspan;
			setEntry(newspan);
		}
	}
}

//Generate the hex pointers on either side of the symbols
var generatePointerColumn = function(value) {
	var string = "";

	var count = 0;
	do{
		string += convertToHex(value) + "<BR/>";
		value += 12;
		count++;
	} while (count < 17);
	return string;
}

//Generate a set of 12*17 symbols including words.
var generateSymbolColumn = function() {
	var symbols = ["!","\"","`","$","%","^","&","*","(",")",
			"-","_","+","=","{","[","}","]",":",";",
			"@","\'","~","#","<",">",",","?","/",
			"|","\\"]
	var string = "";
	var count = 0;
	var numsymbols = 0;
	while (count < 17*12) {
		string += "<span class='symbol' onmouseover=\"hoversym(this)\" onclick=\"clicked(this)\">"
		+ symbols[generateRandomInt(0,symbols.length)] + " </span>";
		count++;
		numsymbols++;

		//Choose to add a word
		if((count + wordlength < 17*12)
			&& (numsymbols > 4)
			&& (numsymbols == 45 || (generateRandomInt(0,17) > 15))){

			//Select a random word
			var wordpos = generateRandomInt(0,allWords.length);
			var word = allWords[wordpos];

			//Remove the element from the array
			allWords.splice(wordpos, 1);

			//Store the word with the other words in a list.
			words.push(word);

			var returned = addWord(string, word, count);
			string = returned[1];
			count = returned[0];
			numsymbols = 0;

		}
		string = addBreakIfNeeded(string, count);
	}
	return string;
}

var fixImages = function(){
	var container = document.getElementById("post-container");
	var images = container.querySelectorAll("img");
	for (i = 0; i < images.length; i++){
		var image = images[i];
		var parent = image.parentNode;

		var parentdiv = document.createElement("DIV");
		parentdiv.className = "image-container";

		var colordiv = document.createElement("DIV");
		colordiv.className = "image-color";

		var clearfix = document.createElement("DIV");
		clearfix.style.clear = "both";

		parent.insertBefore(parentdiv, image);
		parent.removeChild(image);

		parentdiv.appendChild(colordiv);
		parentdiv.appendChild(clearfix);

		colordiv.appendChild(image);
	}
}

var login = function() {
	document.getElementById("hacking").style.display="none";
	document.getElementById("loggedin").style.display="block";
	window.addEventListener("load", resizeLoggedIn, false);
	window.addEventListener("resize", resizeLoggedIn, false);
	resizeLoggedIn();
	//Play login sound
	document.getElementById("login").play();
};

var turnOnCursor = function(doNext) {
	return function() {
		document.getElementById("cp-cursor").className = "cursor-on";
		doNext();
	}
}

var turnOffCursor = function(doNext) {
	return function() {
		document.getElementById("cp-cursor").className = "cursor-off";
		doNext();
	}
}

var typingEnter = function (doNext) {
	return function() {
		document.getElementById("enter").play();
		doNext();
	}
}

var flashCursor = function (doNext) {
	return function() {
		document.getElementById("cp-cursor").className = "cursor-flash";
		doNext();
	}
}

var getNextPrint = function(text, delay, nextFunction,isMachine) {
	var randomDelay = generateRandomInt(0,40);
	return function(){
		setTimeout(function() {
			document.getElementById("command-prompt").innerHTML+=text;
			if(isMachine){
				tickNoise();
			}else{
				playKeyboardSound();
			}
			nextFunction();
		},delay + randomDelay);
	};
};

var printCommandPrompt = function(){
	//We want to do this backwards, because it's the only thing I can think of without wifi...
	//Ie, we're going to nest our timeouts inside each other, which means we need to look at the last one first.

	//The last thing we want to chain is this last guy
	var nextFunction = function(){
		finishedPrinting = true;
		if(finishedLoading){
			setTimeout(beginMinigame,2000);
		}
	}

	//Cue up and next text, last-first
	for (i = commandPromptText.length-1; i >= 0; i--) {
		textBlock = commandPromptText[i];
		if(textBlock.isMachine){
			//If it's a machine text, we print all at once, and turn off the cursor
			nextFunction = getNextPrint(textBlock.text, textBlock.delay, nextFunction,true);

		} else {
			//If it's a human text, we print character by character (cued up last first)
			//We want to flash the cursor before typing, make it solid during typing, and turn it off after

			//This is executed after finished typing, so turn off cursor and play enter sound
			nextFunction = typingEnter(turnOffCursor(nextFunction));

			//Simulate the typing
			var mytext = textBlock.text;
			for (j = mytext.length-1; j >= 0; j--) {
				mycharacter = mytext[j];
				nextFunction = getNextPrint(mycharacter, textBlock.delay, nextFunction,false);
			}

			//Before we start typing, we want to make the cursor solid
			nextFunction = turnOnCursor(nextFunction);
			//Delay to simulate user thinking
			var randomDelay = generateRandomInt(0,800)
			nextFunction = getNextPrint("",500+randomDelay,nextFunction);
			//Flashing whilst the delay (above) happens
			nextFunction = flashCursor(nextFunction);
		}
	}

	//We've done every bit of text - let's play!
	nextFunction();
}

var beginMinigame = function() {
	if(minigameBegun == true){
		return false;
	}
	document.getElementById("leftpointers").innerHTML = ptrleft;
	document.getElementById("rightpointers").innerHTML = ptrright;
	document.getElementById("leftsymbols").innerHTML = symbolsleft;
	document.getElementById("rightsymbols").innerHTML = symbolsright;
	insertGoal();
	document.getElementById("loading").style.display="none";
	document.getElementById("hacking").style.display = "block";
	var minigameBegun = true;
}

var preloadHacking = function() {
	//Generate the pointers
	var value = Math.floor(Math.random() * 65128);
	ptrleft = generatePointerColumn(value);
	ptrright = generatePointerColumn(value+204);

	//Load the wordslist and generate the symbols
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'https://jetroid-hacking.herokuapp.com/', true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
			//Everything successful and OK
			var response = JSON.parse(xhr.responseText);
			goalWord = response["goal"];
			allWords = response["words"];
			wordlength = response["length"];
		} else {
			//Some kind of network error
			//Fall back to predefined set of words
			goalWord = "BONFIRE";
			allWords = ["FALLACY","REPATCH","SWELTER","PROMOTE","SOURCES","PREWORN","DUALITY",
				"VOIDING","BOBBIES","COPPICE","BANDITO","BOILERS","BOXLIKE","CONFORM","CONFIRM",
				"CONFIDE","GUNFIRE","FOXFIRE","CONFINE"];
			wordlength = 7;
		}
		symbolsleft = generateSymbolColumn();
		symbolsright = generateSymbolColumn();
		finishedLoading = true;
		if(finishedPrinting){
			beginMinigame();
		}
	}
	xhr.send(null);
}

function insertGoal(){
	//Get all the words in the document
	var wordElems = document.querySelectorAll(".word");
	//Select one to replace with the goal
	var goalElem = wordElems[generateRandomInt(0,wordElems.length)];

	//Constuct the replacement content
	var elemContent = goalElem.innerHTML;
	var prevWord = goalElem.id;
	var wordLen = elemContent.length;
	var charIndex = 0;
	for(var i = 0; i < wordLen; i++){
		if (elemContent.charAt(i) === prevWord.charAt(charIndex)){
			elemContent = newStrWithCharAt(elemContent, i, goalWord.charAt(charIndex));
			charIndex++;
		}
	}

	//Replace the content with our goal content
	goalElem.id = goalWord;
	goalElem.innerHTML = elemContent;
}

function newStrWithCharAt(str,index,chr) {
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
}

var turnOn = function() {
	//Disable the 'turned off' greyness
	document.body.className = "";
	//Play login sound
	document.getElementById("login").play();

	//get the hum sound
	var hum_sound = document.getElementById("hum");
	//make it quieter
	hum_sound.volume = 0.2;
	//Make it play
	hum_sound.play()
	//Make it seemless loop
	document.getElementById("hum").addEventListener('timeupdate', function(){
    var buffer = .44
    if(this.currentTime > this.duration - buffer){
        this.currentTime = 0
        this.play()
    }}, false);

	//Hide the 'begin' stuff
	document.getElementById("click-to-start").style.display="none";
	//Show the command prompt thing
	document.getElementById("loading").style.display="block";
	printCommandPrompt();
}

window.onload = function(){
	preloadHacking();
	//Try to force user to landscape
	screen.orientation.lock('landscape');
}