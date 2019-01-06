var symbolSpansLeft = [];
var symbolSpansRight = [];
var pointerSpansLeft = [];
var pointerSpansRight = [];
//Words the user has not tried clicking on
var allWords = [];
//All the words we are currently displaying
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
	{"text":"WELCOME TO ROBCO INDUSTRIES (TM) TERMLINK", "isMachine":true, "delay":10, "targetId":"loading-welcome"},
	{"text":"\>", "isMachine":true, "delay":400, "targetId":"loading-firsttype"},
	{"text":"SET TERMINAL/INQUIRE", "delay":50, "targetId":"loading-firsttype"},
	{"text":"RX-9000", "isMachine":true, "delay":10, "targetId":"loading-terminalmodel"},
	{"text":"\>", "isBreak":true, "delay":200, "targetId":"loading-secondtype"},
	{"text":"SET FILE/PROTECTION=OWNER:RWED ACCOUNTS.F", "delay":55, "targetId":"loading-secondtype"},
	{"text":"\>", "isBreak":true, "delay":800, "targetId":"loading-thirdtype"},
	{"text":"SET HALT RESTART/MAINT", "delay":50, "targetId":"loading-thirdtype"},
	{"text":"Initializing RobCo Industries(TM) MF Boot Agent v2.3.0", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"<br>", "isBreak":true, "isSilent":true, "delay":100, "targetId":"loading-information"},
	{"text":"RETROS BIOS", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"<br>", "isBreak":true, "isSilent":true, "delay":150, "targetId":"loading-information"},
	{"text":"RBIOS-4.02.08.00 52EE5.E7.E8", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"<br>", "isBreak":true, "isSilent":true, "delay":200, "targetId":"loading-information"},
	{"text":"Copyright 2075-2077 RobCo Ind.", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"<br>", "isBreak":true, "isSilent":true, "delay":600, "targetId":"loading-information"},
	{"text":"Uppermem: 1024 KB", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"<br>", "isBreak":true, "isSilent":true, "delay":150, "targetId":"loading-information"},
	{"text":"Root (5A8)", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"<br>", "isBreak":true, "isSilent":true, "delay":150, "targetId":"loading-information"},
	{"text":"Maintenance Mode", "isMachine":true, "delay":10, "targetId":"loading-information"},
	{"text":"\>", "isBreak":true, "delay":150, "targetId":"loading-fourthtype"},
	{"text":"RUN DEBUG/ACCOUNTS.F", "delay":45, "targetId":"loading-fourthtype"}
];
var minigameText = [
	{"text":"ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL", "isMachine":true, "delay":10},
	{"text":"ENTER PASSWORD NOW", "isMachine":true, "delay":10},
	{"text":"4 Attempt(s) Left: ██ ██ ██ ██", "isMachine":true, "delay":10},
];
//Prerendered left and right pointers and symbols columns 
var ptrleft = "";
var ptrright = "";
var symbolsleft = "";
var symbolsright = "";
//Booleans to track status
var finishedLoading = false;	//Have we finished getting words from remote server?
var finishedPrinting = false;	//Have we finished printing the ROBOCO TERMLINK crawl?
var minigameSetupBegun = false;	//Just used to prevent double triggering of the minigame setup
var enableMinigame = false;		//Can the user interact with the minigame?
//Int keeping track of machine printed characters (eg "Welcome to the ROBCO ...")
var printCount = 0;
//Used for the text entry place during the hacking minigame.
var targetText = "";
var currentText = "";
var highlighted_spans = [];

var tickNoise = function(){
	document.getElementById("tick").currentTime = 0;
	document.getElementById("tick").play();
};

var generateDataCorruption = function(){
	var string = "";
	var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";
	var symbols = "~#!\"$%^&*()_-+=[]{}?/,.";
	var words = ["if","it","is","can","we","space","V4ult Teg","Pos0idon Enerxy","J3tRo1d","data","0x0000","FrxquenFy C00tral","yes","no","maybe","believe","God","food","Dog","THr33","LFser RiMle","D3thclRAW","HeliDX Hne","Help Me","MissiX9ippi QuantuXo.z P3!"];
	var numsymbols = generateRandomInt(250,300);
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
var exitPost = function(e){
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
var addEntryCharacter = function() {
	if(currentText === targetText || currentText.length >= targetText){
		document.getElementById("hack-cursor").className = "cursor-flash"
		return;
	}
	playKeyboardSound();
	var newText = currentText + targetText[currentText.length] + targetText[currentText.length + 1];
	currentText = newText;
	document.getElementById("entry").textContent = newText;
	var randomDelay = generateRandomInt(0,40);
	setTimeout(addEntryCharacter,30+randomDelay);
}
var setEntry = function(content){
	targetText = content;
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
	if(enableMinigame != true) return;
	if(terminalLocked) return;
	document.getElementById("enter").play();

	if(span.classList.contains("word")){
		var word = getWordFromSpan(span);
		var wordNoSpaces = word.replace(/ /g,"");
		if (word.match(/\.+/)){
			//Handle the click on a dud
			addFeedback(">Error");
		}else if (wordNoSpaces != goalWord){
			document.getElementById("incorrect").play();
			var correct = 0;
			for(i = 0; i < wordlength; i++){
				if(goalWord.charAt(i) == wordNoSpaces.charAt(i)) correct++;
			}
			addFeedback(">" + word);
			addFeedback(">Entry Denied");
			addFeedback(">"+ correct + "/" + wordlength + " correct.");
			attempts--;
			setAttempts();
		}else{
			terminalLocked = true;
			document.getElementById("correct").play();
			addFeedback(">" + word);
			addFeedback(">Exact match!");
			addFeedback(">Please wait");
			addFeedback(">while system");
			addFeedback(">is accessed.");
			setTimeout(login, 2000);
		}
	}else if(span.parentElement.classList.contains("bracketpair")) {
		//Don't do anything if our parent is a bracket pair
	}else if(span.classList.contains("symbol")){
		var symbol = span.innerHTML;
		addFeedback(">" + symbol);
		addFeedback(">Error");
	}else if(span.classList.contains("bracketpair")){
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
			var dudSpans = document.getElementsByClassName("word-" + dudWord);
			for(var i = 0; i < dudSpans.length; i++) {
				dudSpans[i].textContent = ". ";
				dudSpans[i].classList.remove("word");
				dudSpans[i].classList.add("symbol");
			}
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

var addBreakIfNeeded = function(symbolSpans, column){
	if(symbolSpans.length != 0 && symbolSpans.length % 12 == 0){
		column.appendChild(document.createElement("BR"));
	}
}

var addWord = function(symbolSpans, column, word){
	//Add each letter of the word we have selected to the column
	for(i = 0; i < word.length; i++){
		var newspan = document.createElement("SPAN");
		newspan.className = "word word-" + word;
		newspan.onclick = (function(newspan){ return function(){clicked(newspan);};})(newspan);
		newspan.onmouseleave = (function(newspan){ return function(){unhover(newspan);};})(newspan);
		newspan.onmouseenter = (function(newspan){ return function(){hover(newspan);};})(newspan);
		newspan.attributes["data-shouldbe"] = word.charAt(i) + " ";
		newspan.attributes["data-charpos"] = i;
		newspan.textContent = " ​ "; //There's a zero width space here!
		column.appendChild(newspan);
		symbolSpans.push(newspan);
		addBreakIfNeeded(symbolSpans, column);
	}
}

var getWordFromSpan = function(span) {
	//Determine the correct classname that identifies this word
	var classes = span.className.split(" ");
	var wordClass = "";
	for (var i = 0; i < classes.length; i++){
		var className = classes[i];
		if (className.startsWith("word-")) {
			wordClass = className;
		}
	}
	//replace the "word-" prefix with nothing (to get the word)
	var word = wordClass.replace("word-","");
	//Now add spaces between (and after)
	return word.split("").join(" ") + " "; //ie `h e l l o `
}

//Generate an Int between lower (inclusive) and upper (exclusive)
var generateRandomInt = function(lower, upper){
	return Math.floor(Math.random()*((upper-1)-lower+1)+lower);
}

var playKeyboardSound = function() {
	var soundID = generateRandomInt(1,9);
	var sound = document.getElementById("key" + soundID);
	sound.currentTime = 0;
	sound.play();
}

var detectClosingBracket = function(span){
	var opening_bracket = span.innerHTML;
	if (clickedBrackets.has(span)) {
		return false;
	}
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
		} else if(object.classList.contains( "word")
				|| object.innerHTML == ""){
			return false;
		}
	} while(true);	//Keep looking until we find the end
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
var hover = function(span) {
	if(enableMinigame != true){
		return;
	}
	//Do special stuff if it's a word 
	if (span.classList.contains("word")) {
		var word = getWordFromSpan(span);
		var wordNoSpaces = word.replace(/ /g,"");
		//Hightlight the word
		var wordSpans = document.getElementsByClassName("word-" + wordNoSpaces);
		for(var i = 0; i < wordSpans.length; i++) {
			var wordSpan = wordSpans[i];
			wordSpan.classList.add("highlight");
		}
		setEntry(word);
	} else {
		span.classList.add("highlight");
		setEntry(span.textContent);
		var chr = span.innerHTML[0];
		//If touch an opening bracket
		if (chr === '{' || chr === '[' || chr === '(' || span.innerHTML === "&lt; "){
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
				setEntry(newspan.textContent);
			}
		}
	}
}
var unhover = function(span) {
	//Do special stuff if it's a word 
	span.classList.remove("highlight");
	if (span.classList.contains("word")) {
		//Determine the correct classname that identifies this word
		var classes = span.className.split(" ");
		var wordClass = "";
		for (var i = 0; i < classes.length; i++){
			var className = classes[i];
			if (className.startsWith("word-")) {
				wordClass = className;
			}
		}
		//unhightlight the word
		var wordSpans = document.getElementsByClassName(wordClass);
		for(var i = 0; i < wordSpans.length; i++) {
			var wordSpan = wordSpans[i];
			wordSpan.classList.remove("highlight");
		}
	}
}

//Generate the hex pointers on either side of the symbols
var generatePointerColumn = function(ptrSpans, value) {
	var column = document.createElement("DIV");

	var count = 0;
	do{
		var newspan = document.createElement("SPAN");
		newspan.textContent = " ​ "; //There's a zero width space here!
		newspan.attributes["data-shouldbe"] = convertToHex(value);
		column.appendChild(newspan);
		ptrSpans.push(newspan);
		var brk = document.createElement("BR");
		column.appendChild(brk);
		value += 12;
		count++;
	} while (count < 17);
	return column;
}

//Generate a set of 12*17 symbols including words.
var generateSymbolColumn = function(symbolSpans, column) {
	var symbols = ["!","\"","`","$","%","^","&","*","(",")",
			"-","_","+","=","{","[","}","]",":",";",
			"@","\'","~","#","<",">",",","?","/",
			"|","\\"]
	//Number of symbols since we had a word
	var numsymbols = 0;
	while (symbolSpans.length < 17*12) {
		var newspan = document.createElement("SPAN");
		newspan.className = "symbol";
		newspan.onmouseenter = (function(newspan){return function(){hover(newspan);};})(newspan);
		newspan.onmouseleave = (function(newspan){return function(){unhover(newspan);};})(newspan);
		newspan.onclick = (function(newspan){return function(){clicked(newspan);};})(newspan);
		newspan.attributes["data-shouldbe"] = symbols[generateRandomInt(0,symbols.length)] + " ";
		newspan.textContent = " ​ ";	//There's a zero width space here!
		column.appendChild(newspan);
		symbolSpans.push(newspan);
		addBreakIfNeeded(symbolSpans, column);
		numsymbols++;

		//Choose to add a word or not
		if((symbolSpans.length + wordlength < 17*12)
			&& (numsymbols > 4)
			&& (numsymbols == 45 || (generateRandomInt(0,17) > 15))){

			//Select a random word
			var wordpos = generateRandomInt(0,allWords.length);
			var word = allWords[wordpos];

			//Remove the word from the array so we don't put in duplicates
			allWords.splice(wordpos, 1);

			//Store the word with the words we have selected.
			words.push(word);

			//Generate the spans for the word
			addWord(symbolSpans, column, word);
			numsymbols = 0;
		}
	}
	return column;
}

var fixImages = function(){
	var container = document.getElementById("post-container");
	var images = container.querySelectorAll("img");
	for (i = 0; i < images.length; i++){
		var image = images[i];
		var parent = image.parentNode;

		//Make background-image of `var image` equal to the src of the image
		//as this way we can use background-blend-mode
		image.src = image.getAttribute("data-src");
		image.style.backgroundImage = 'url(' + image.getAttribute("data-src") +')'; 


		var parentdiv = document.createElement("DIV");
		parentdiv.className = "image-container";

		var colordiv = document.createElement("DIV");
		colordiv.className = "image-color";

		if (image.classList.contains("emoji")) {
			parentdiv.classList.add("emoji-container");
		}

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
	};
}

var turnOffCursor = function(doNext) {
	return function() {
		document.getElementById("cp-cursor").className = "cursor-off";
		doNext();
	};
}

var typingEnter = function (doNext) {
	return function() {
		document.getElementById("enter").play();
		doNext();
	};
};

var flashCursor = function (doNext) {
	return function() {
		document.getElementById("cp-cursor").className = "cursor-flash";
		doNext();
	}
};

var getNextPrint = function(printElem, text, delay, nextFunction, isMachine, isSilent) {
	var randomDelay = 0;
	return function(){
		setTimeout(function() {
			if(!finishedPrinting){
				printElem.previousElementSibling.classList.remove("activeCommandPrompt");
				printElem.classList.add("activeCommandPrompt");
				printElem.innerHTML+=text;
				if(isSilent) {
					//Play no sound!
				} else if(isMachine){
					playPrintBeep();
				}else{
					playKeyboardSound();
					randomDelay = generateRandomInt(0,40);
				}
				nextFunction();
			}
		},delay + randomDelay);
	};
};

var playPrintBeep = function(){
	if(printCount == 0) {
		document.getElementById("print").play();
	}
	printCount += 1;
	if (printCount > 4) {
		printCount = 0;
	}
};

var printCommandPrompt = function(){
	//We want to do this backwards, because it's the only thing I can think of without wifi...
	//Ie, we're going to nest our timeouts inside each other, which means we need to look at the last one first.

	//The last thing we want to chain is this last guy
	var nextFunction = function(){
		finishedPrinting = true;
		if(finishedLoading){
			setTimeout(beginMinigame,700);
		}
	}

	//Cue up and next text, last-first
	for (i = commandPromptText.length-1; i >= 0; i--) {
		textBlock = commandPromptText[i];
		var targetElem = document.getElementById(textBlock.targetId);
		if(textBlock.isBreak){
			//If it's something with a linebreak, we print it all in one go.
			nextFunction = getNextPrint(targetElem, textBlock.text, textBlock.delay, nextFunction,true,textBlock.isSilent);

		} else if (textBlock.isMachine) {
			//If it's a machine text, we print character by character (cued up last first)

			//We want to make the cursor solid during printing, and turn it off after

			//This is executed after finished typing, so turn off cursor
			printCount = 0;
			nextFunction = turnOffCursor(nextFunction);

			//Simulate the printing
			var mytext = textBlock.text;
			for (j = mytext.length-1; j >= 0; j--) {
				mycharacter = mytext[j];
				nextFunction = getNextPrint(targetElem, mycharacter, textBlock.delay, nextFunction,true,textBlock.isSilent);
			}

			//Before we start printing, we want to make the cursor solid
			nextFunction = turnOnCursor(nextFunction);
		} else {

			//If it's a text, we print character by character (cued up last first)

			//We want to flash the cursor before typing, make it solid during typing, and turn it off after

			//This is executed after finished typing, so turn off cursor and play enter sound
			nextFunction = typingEnter(turnOffCursor(nextFunction));

			//Simulate the typing
			var mytext = textBlock.text;
			for (j = mytext.length-1; j >= 0; j--) {
				mycharacter = mytext[j];
				nextFunction = getNextPrint(targetElem, mycharacter, textBlock.delay, nextFunction,false,textBlock.isSilent);
			}

			//Before we start typing, we want to make the cursor solid
			nextFunction = turnOnCursor(nextFunction);
			//Delay to simulate user thinking
			var randomDelay = generateRandomInt(0,800)
			nextFunction = getNextPrint(targetElem, "",500+randomDelay,nextFunction);
			//Flashing whilst the delay (above) happens
			nextFunction = flashCursor(nextFunction);
		}
	}

	//We've queued every bit of text - let's rip!
	nextFunction();
};



var printMinigame = function() {
	//To show up the symbols/pointers in the minigame
	var revealSymbol = function(nextFunction, span, cursorSpan) {
		return function() {
			setTimeout(function(){
				span.textContent = span.attributes["data-shouldbe"];
				if(cursorSpan != undefined) {
					cursorSpan.textContent = "█";
				}
				playPrintBeep();
				nextFunction();
			},4);
		}
	};

	//For the header - a stripped down version of getNextPrint
	var printText = function(printElem, text, nextFunction) {
		return function(){
			setTimeout(function() {
				printElem.innerHTML+=text;
				playPrintBeep();
				nextFunction();
			},4);
		};
	};

	//This is the last thing we do
	var nextFunction = function(){
		//This is the last thing we do
		//Display the prompt and beep
		document.getElementById("minigame-prompt").style.display="block";
		printCount = 0;
		playPrintBeep();
		//Enable the functionality!
		enableMinigame = true;
	}

	//Print the pointers and the symbols on the right
	for(var i = 16; i >= 0; i--){
		//Symbols
		for (var j = 11; j >= 0; j--){
			nextFunction = revealSymbol(nextFunction, symbolSpansRight[i*12 + j], symbolSpansRight[i*12 + j + 1]);
		}
		//Pointer
		nextFunction = revealSymbol(nextFunction, pointerSpansRight[i], symbolSpansRight[i*12]);
	}

	//Print the pointers and the symbols on the left
	for(var i = 16; i >= 0; i--){
		//Symbols
		for (var j = 11; j >= 0; j--){
			nextFunction = revealSymbol(nextFunction, symbolSpansLeft[i*12 + j], symbolSpansLeft[i*12 + j + 1]);
		}
		//Pointer
		nextFunction = revealSymbol(nextFunction, pointerSpansLeft[i], symbolSpansLeft[i*12]);
	}

	//Simulate the printing for the last header part
	var printElem = document.getElementById("attemptsleft");
	var mytext = minigameText[2].text;
	for (var i = mytext.length-1; i >= 0; i--) {
		mycharacter = mytext[i];
		nextFunction = printText(printElem, mycharacter, nextFunction);
	}

	//Simulate the printing for the second header part
	printElem = document.getElementById("message");
	mytext = minigameText[1].text;
	for (var i = mytext.length-1; i >= 0; i--) {
		mycharacter = mytext[i];
		nextFunction = printText(printElem, mycharacter, nextFunction);
	}

	//Simulate the printing for the first header part
	printElem = document.getElementById("termlink");
	mytext = minigameText[0].text;
	for (var i = mytext.length-1; i >= 0; i--) {
		mycharacter = mytext[i];
		nextFunction = printText(printElem, mycharacter, nextFunction);
	}

	//We've queued every bit of text - let's rip!
	nextFunction();
};

var beginMinigame = function() {
	if(minigameSetupBegun == true){
		return false;
	}
	var minigameSetupBegun = true;
	document.getElementById("leftpointers").appendChild(ptrleft);
	document.getElementById("rightpointers").appendChild(ptrright);
	document.getElementById("loading").style.display="none";
	document.getElementById("hacking").style.display = "block";
	printMinigame();
};

var finishPreload = function() {
	generateSymbolColumn(symbolSpansLeft,document.getElementById("leftsymbols"));
	generateSymbolColumn(symbolSpansRight,document.getElementById("rightsymbols"));
	insertGoal();
	finishedLoading = true;
	if(finishedPrinting){
		beginMinigame();
	}else{
		document.getElementById("loading").onclick = function(){
			finishedPrinting = true;
			beginMinigame()
		};
	}
}

var preloadHacking = function() {
	//Generate the pointers
	var value = Math.floor(Math.random() * 65128);
	ptrleft = generatePointerColumn(pointerSpansLeft, value);
	ptrright = generatePointerColumn(pointerSpansRight, value+204);

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
			finishPreload();
		} else if(xhr.readyState == XMLHttpRequest.DONE) {
			//Some kind of network error
			//Fall back to predefined set of words
			goalWord = "BONFIRE";
			allWords = ["FALLACY","REPATCH","SWELTER","PROMOTE","SOURCES","PREWORN","DUALITY",
				"VOIDING","BOBBIES","COPPICE","BANDITO","BOILERS","BOXLIKE","CONFORM","CONFIRM",
				"CONFIDE","GUNFIRE","FOXFIRE","CONFINE"];
			wordlength = 7;
			finishPreload();
		}
	}
	xhr.send(null);
};

var insertGoal = function() {
	//Select a word one to replace with the goal
	var wordindex = generateRandomInt(0,words.length);
	var wordToReplace = words[wordindex];
	//We're no longer using this word, so remove it from the set of words
	words.splice(wordindex,1)

	//Get the spans that correspond to the word we want to replace
	var spansToChange = Array.prototype.slice.call(document.getElementsByClassName("word-" + wordToReplace));
	for(var k = 0; k < spansToChange.length; k++) {
		var span = spansToChange[k];
		span.classList.remove("word-" + wordToReplace);
		span.classList.add("word-" + goalWord);
		var position = span.attributes["data-charpos"];

		span.attributes["data-shouldbe"] = goalWord[position] + " ";
	}
};

var turnOn = function() {
	toggleFullScreen();
	//Disable the 'turned off' greyness
	document.body.className = "";
	//Play login sound
	var loginSound = document.getElementById("login");
	//Begin printing the command prompt when login sound ends
	loginSound.onended = function() {
    	printCommandPrompt();
	};
	loginSound.play();

	//get the hum sound
	var hum_sound = document.getElementById("hum1");
	var hum_sound2 = document.getElementById("hum2");
	//make it quieter
	hum_sound.volume = 0.2;
	hum_sound2.volume = 0.4;
	//Make it play
	hum_sound.play()
	hum_sound2.play()
	//Make it seemless loop
	document.getElementById("hum1").addEventListener('timeupdate', function(){
    var buffer = .44
    if(this.currentTime > this.duration - buffer){
        this.currentTime = 0
        this.play()
    }}, false);
    document.getElementById("hum2").addEventListener('timeupdate', function(){
    var buffer = .44
    if(this.currentTime > this.duration - buffer){
        this.currentTime = 0
        this.play()
    }}, false);

	//Hide the 'begin' stuff
	document.getElementById("click-to-start").style.display="none";
	//Show the command prompt thing
	document.getElementById("loading").style.display="block";
}

var maximiseInfo = function() {
	document.getElementById("information-anchor").classList.toggle("open");
	document.getElementById("information-text").classList.toggle("open");
	document.getElementById("information-expand-shrink").classList.toggle("open");
	document.getElementById("information-hide").classList.toggle("open");
}

var hideInfo = function() {
	document.getElementById("information").classList.toggle("hide");
	document.getElementById("information-anchor").classList.remove("open");
	document.getElementById("information-text").classList.remove("open");
	document.getElementById("information-expand-shrink").classList.remove("open");
	document.getElementById("information-hide").classList.remove("open");
}

var mute = function() {
	var muteButton = document.getElementById("information-mute-unmute");
	muteButton.classList.toggle("mute");
	var sounds = document.getElementById("terminal-sounds").childNodes;
	for(var i = 0; i < sounds.length; i++) {
		//There's no toggle property for mute, we'll determine if muting
		//or unmuting based on if the button has mute class.
		if(muteButton.classList.contains("mute")){
			sounds[i].muted = true;
		} else {
			sounds[i].muted = false;
		}
	}
}

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

window.onload = function(){
	preloadHacking();
}