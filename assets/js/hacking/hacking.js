var symbolSpansLeft = [];
var symbolSpansRight = [];
var pointerSpansLeft = [];
var pointerSpansRight = [];
var spaces = [];
var cursors = [];
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
	{text:"WELCOME TO ROBCO INDUSTRIES (TM) TERMLINK", isMachine:true, delay:10, targetId:"loading-welcome", cursorId:"cp-cursor"},
	{text:"\>", isMachine:true, delay:400, targetId:"loading-firsttype", cursorId:"cp-cursor"},
	{text:"SET TERMINAL/INQUIRE", "isHuman":true, delay:50, targetId:"loading-firsttype", cursorId:"cp-cursor"},
	{text:"RX-9000", isMachine:true, delay:10, targetId:"loading-terminalmodel", cursorId:"cp-cursor"},
	{text:"\>", "isBreak":true, delay:200, targetId:"loading-secondtype", cursorId:"cp-cursor"},
	{text:"SET FILE/PROTECTION=OWNER:RWED ACCOUNTS.F", "isHuman":true, delay:55, targetId:"loading-secondtype", cursorId:"cp-cursor"},
	{text:"\>", "isBreak":true, delay:800, targetId:"loading-thirdtype", cursorId:"cp-cursor"},
	{text:"SET HALT RESTART/MAINT", "isHuman":true, delay:50, targetId:"loading-thirdtype", cursorId:"cp-cursor"},
	{text:"Initializing RobCo Industries(TM) MF Boot Agent v2.3.0", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"<br>", "isBreak":true, "isSilent":true, delay:100, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"RETROS BIOS", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"<br>", "isBreak":true, "isSilent":true, delay:150, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"RBIOS-4.02.08.00 52EE5.E7.E8", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"<br>", "isBreak":true, "isSilent":true, delay:200, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"Copyright 2075-2077 RobCo Ind.", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"<br>", "isBreak":true, "isSilent":true, delay:600, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"Uppermem: 1024 KB", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"<br>", "isBreak":true, "isSilent":true, delay:150, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"Root (5A8)", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"<br>", "isBreak":true, "isSilent":true, delay:150, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"Maintenance Mode", isMachine:true, delay:10, targetId:"loading-information", cursorId:"cp-cursor"},
	{text:"\>", "isBreak":true, delay:150, targetId:"loading-fourthtype", cursorId:"cp-cursor"},
	{text:"RUN DEBUG/ACCOUNTS.F", "isHuman":true, delay:45, targetId:"loading-fourthtype", cursorId:"cp-cursor"}
];
var minigameText = [
	{text:"ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL", isMachine:true, delay:10, targetId:"termlink", cursorId:"hack-cursor1"},
	{text:"ENTER PASSWORD NOW", isMachine:true, delay:10, targetId:"message", cursorId:"hack-cursor1"},
	{text:"<br> ​", "isBreak":true, "isSilent":true, delay:0, targetId:"message", cursorId:"hack-cursor1"},
	{text:"4 Attempt(s) Left:", isMachine:true, delay:10, targetId:"attemptstext", cursorId:"hack-cursor1"},
	{text:" ██ ██ ██ ██", isMachine:true, delay:0, targetId:"attemptsblocks", cursorId:"hack-cursor1"},
	{text:"<br> ​", "isBreak":true, "isSilent":true, delay:0, targetId:"attemptsnewline", cursorId:"hack-cursor1"},
];
//Prerendered left and right pointers and symbols columns
var ptrleft = "";
var ptrright = "";
var symbolsleft = "";
var symbolsright = "";
//Booleans to track status
var clickedBegin = false;
var finishedLoading = false;	//Have we finished getting words from remote server?
window.finishedPrinting = false;	//Have we finished printing the ROBOCO TERMLINK crawl?
var minigameSetupBegun = false;	//Just used to prevent double triggering of the minigame setup
var minigameStarted = false;	//Has the user started playing?
var enableMinigame = false;		//Can the user interact with the minigame right now?
var enablePosts = false;		//Can the user interact with the post list?
var enablePost = false;			//Can the user interact with a post?
//Cursors for navigation
var hackingCursorX = null;
var hackingCursorY = null;
var postListCursor = null;
//Span we're currently highlighting in hacking
var highlighted;
//Int keeping track of machine printed characters (eg "Welcome to the ROBCO ...")
var printCount = 0;
//Used for the text entry place during the hacking minigame.
var targetText = "";
var currentText = "";
var highlighted_spans = [];
//Data for the post we are currently viewing
var jsonObject = { type: "div", content: [], attributes: {} };
var preloadedPage = null;

var tickNoise = function(){
	document.getElementById("tick").currentTime = 0;
	document.getElementById("tick").play();
};

/* Source: https://stackoverflow.com/a/6969486/6822172 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

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

var heightWithoutPadding = function(element) {
	var elementStyle = getComputedStyle(element);
	return element.clientHeight
	  - parseFloat(elementStyle.paddingTop)
	  - parseFloat(elementStyle.paddingBottom);
}
var fixYoutubes = function () {
	var container = document.getElementById("loggedin");
	var youtubes = container.querySelectorAll(".youtube");
	for (var i = 0; i < youtubes.length; i++) {
		var youtube = youtubes[i];

		youtube.style.height = "0px";
		var containerHeight = heightWithoutPadding(container);
		var osHeight = document.getElementById("os-header").clientHeight;
		var youtubeHeight = containerHeight - osHeight;
		youtube.style.height = youtubeHeight + "px";

		/* 16:9 aspect, so... */
		youtube.style.width = (16/9)*youtubeHeight + "px";
	}
}
var fixImages = function(){
	var container = document.getElementById("loggedin");
	var images = container.querySelectorAll("img");
	for (var i = 0; i < images.length; i++) {
		var image = images[i];
		var parent = image.parentNode;

		//Make background-image of `var image` equal to the src of the image
		//as this way we can use background-blend-mode
		image.style.backgroundImage = 'url(' + image.getAttribute("src") +')';

		/* Create the containers that we use for the
		fuzzy green effects */
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

		/* Make the image height equal to the container's remaining space */
		image.style.height = "0px";
		var containerHeight = heightWithoutPadding(container);
		var osHeight = document.getElementById("os-header").clientHeight;
		var parentHeight = parentdiv.parentNode.clientHeight;
		var imageHeight = containerHeight - (osHeight + parentHeight);
		image.style.height = imageHeight + "px";
	}
}

/* Used to check if JSON tree contains an IMG tag */
function hasImage(elem) {
	if (typeof elem === "string") {
		return false;
	}
	if (elem.type.toUpperCase() === "IMG") {
		return true;
	}
	for (var e = 0; e < elem.content.length; e++) {
		if (hasImage(elem.content[e])) {
			return true;
		}
	}
	return false;
}

/* Used to check if JSON tree contains a .youtube class */
function hasYoutube(elem) {
	if (typeof elem === "string") {
		return false;
	}
	if (elem.attributes.hasOwnProperty("class") &&
		elem.attributes["class"].split(" ").includes("youtube")) {
			return true;
	}
	for (var e = 0; e < elem.content.length; e++) {
		if (hasYoutube(elem.content[e])) {
			return true;
		}
	}
	return false;
}

/* Used to copy JSON attributes to DOM */
function copyAttributes (newElem, elem) {
	for (var key in elem.attributes) {
		if (elem.attributes.hasOwnProperty(key)) {
			newElem.setAttribute(key, elem.attributes[key]);
		}
	}
}

/* Show next page */
function nextPage() {
	var couldntGenerate = generatePage();
	if (couldntGenerate) {
		enablePosts = true;
		enablePost = false;
		document.getElementById("post-container").classList.add("hidden");
		document.getElementById("blog-posts").classList.remove("hidden");
		document.getElementById("enter").play();
		document.removeEventListener("click", nextPage);
	}
}
/* Show next page from click listener */
function nextPageClick(e) {
	e = window.event || e;
	var element = e.target || e.srcElement;
	if(element.nodeName.toUpperCase() === "A" ||
		element.parentNode.nodeName.toUpperCase() === "A") {
		e.cancel;
		return;
	}

	nextPage();
}

function skipPrinting() {
	window.finishedPrinting = true;
}

function printingDone() {
	document.removeEventListener("click",skipPrinting);
	window.finishedPrinting = true;
	document.addEventListener("click",nextPageClick);
	document.getElementById("loggedin-prompt-text").textContent = "";
	document.getElementById("loggedin-prompt-cursor").className = "cursor-flash";
}

function printPage(page) {
	var messages = [];
	window.finishedPrinting = false;

	function printPageHelper(elements) {
		for (var i = 0; i < elements.length; i++) {
			var sourceElem = elements[i];
			if (sourceElem.nodeType ===	3) {
				/* If the elem is a text node, append the message to the root.*/
				var text = sourceElem.textContent;
				sourceElem.textContent = "";

				var cursor = document.createElement("SPAN");
				cursor.textContent = "█";
				cursor.classList.add("cursor-off");
				sourceElem.parentNode.parentNode.appendChild(cursor);

				messages.push({text:text, isMachine:true, delay:4, target:sourceElem.parentNode, cursor: cursor});
			} else {
				printPageHelper(Array.from(sourceElem.childNodes));
			}
		}
	}

	document.getElementById("loggedin-prompt-cursor").className = "cursor-off";

	printPageHelper(Array.from(page.childNodes));

	console.log(messages);
	printText(messages, "finishedPrinting", printingDone, true);

	document.addEventListener("click", skipPrinting);
	document.removeEventListener("click", nextPageClick);

}

function generatePage() {
	/* Determine the target height for the page element */
	var container = document.getElementById("loggedin");
	var postContainer = document.getElementById("post-container");
	var osheader = document.getElementById("os-header");
	var maxHeight = heightWithoutPadding(container)
	  - heightWithoutPadding(osheader);

	/* Remove any existing pages */
	while (postContainer.lastChild) {
		postContainer.removeChild(postContainer.lastChild);
	}

	/* Return `true` at any point to end the page */
	function handleContent(page, insertInto, content) {
		while(content.length) {
			/* Pick an element, making sure images/videos get their own page */
			var elem;
			if (page.textContent === "") {
				/* No text on our page, so accept anything */
				elem = content[0];
			} else {
				/* We already have text on our page,
				so ignore any element that is an image/youtube
				or has children that are images/youtube */
				for (var i = 0; i < content.length; i++) {
					elem = content[i];
					if (!hasImage(elem) && !hasYoutube(elem)) {
						break;
					}
					}
					/* Fail just in case we do the whole loop */
					if (hasImage(elem) || hasYoutube(elem)) {
					return true;
				}
			}

			if(typeof elem === "string") {
				/* Remove the text element we just looked at */
				var words = elem.split(" ");
				content.splice(content.indexOf(elem),1);
				/* Text nodes need to be in a span to make
				   printing easier */
				var span = document.createElement("SPAN");
				insertInto.appendChild(span);

				while (words.length) {
					var word = words.shift();
					/* If we aren't the last word, add a space. */
					var space = "";
					if (words.length) {
						space = " ";
					}

					/* Add the word and check if it overflows the window */
					span.innerHTML += word + space;
					if (page.clientHeight > maxHeight) {
						/* We went too far, so remove the last word we added */
						span.innerHTML = span.innerHTML.replace(new RegExp(escapeRegExp(word) + ' $'), '');
						/* Add the remaining words back into the start of content */
						words.unshift(word);
						content.unshift(words.join(" "));
						return true;
					}
				}
			} else if (hasImage(elem)) {
				var newElem = document.createElement(elem.type);
				copyAttributes(newElem, elem);
				insertInto.appendChild(newElem);

				/* Images want to be alone on a page,
				possibly with a em sibling. */
				var img = document.createElement("img");
				var imgElem = elem.content.shift();
				copyAttributes(img, imgElem);
				newElem.appendChild(img);

				/* Add the EM if it exists */
				handleContent(page, newElem, elem.content);
				fixImages();

				/* Remove the element we just looked at */
				content.splice(content.indexOf(elem),1);
				return true;
			} else if (hasYoutube(elem)) {
				var newElem = document.createElement(elem.type);
				copyAttributes(newElem, elem);
				insertInto.appendChild(newElem);

				var ret = handleContent(page, newElem, elem.content);
				if (ret === true) {
					return true;
				}
				fixYoutubes();

				/* Remove the element we just looked at */
				content.splice(content.indexOf(elem),1);
				return true;
			} else {
				var newElem = document.createElement(elem.type);
				copyAttributes(newElem, elem);
				insertInto.appendChild(newElem);

				var ret = handleContent(page, newElem, elem.content);
				if (ret === true) {
					return true;
				}
				/* Remove the element we just looked at */
				content.splice(content.indexOf(elem),1);
			}
		}
	}

	var page;
	if (preloadedPage === null) {
		if (jsonObject.content.length === 0) {
			return true;
		}
		/* Create the new page */
		page = document.createElement("div");
		postContainer.appendChild(page);
		handleContent(page, page, jsonObject.content);
	} else {
		page = preloadedPage;
		postContainer.appendChild(preloadedPage);
		preloadedPage = null;
	}
	printPage(page);

	/* If the next page has an image,
	preload the image (and the page) so we don't get pop-in */
	if (jsonObject.content.length &&
		(hasImage(jsonObject.content[0]) ||
		(hasYoutube(jsonObject.content[0])))) {

		/* Temporarily hide our current page */
		page.classList.add("hidden");

		/* Create the new page to preload */
		preloadedPage = document.createElement("div");
		postContainer.appendChild(preloadedPage);
		handleContent(preloadedPage, preloadedPage, jsonObject.content);
		postContainer.removeChild(preloadedPage)

		/* Reshow the page */
		page.classList.remove("hidden");
	}
}

var viewPost = function(postURL) {
	enablePosts = false;
	enablePost = true;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", postURL, true);
	xhr.onreadystatechange = function() {
		//Everything okay
		if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {

			/* TODO:
				This next little block causes us to load all the image sources...
				It would be ideal if that didn't happen. */
			var response = xhr.responseText;
			/* Extract post html from full webpage response */
			var junkElement = document.createElement("div");
			junkElement.innerHTML = response;
			var pC = junkElement.querySelector(".post-container");
			var child = pC.firstChild;
			while((child = child.nextSibling) != null ){
				if(child.id == "post-content") break;
			}
			var elements = Array.from(child.childNodes);

			/* Reformat HTML to JSON as that's easier to handle */
			function handleElements(root, elements){
				for (var i = 0; i < elements.length; i++) {
					var sourceElem = elements[i];
					if (sourceElem.nodeType ===	3) {
						/* If the elem is a text node, append the words to the root.*/
						var text = sourceElem.textContent;
						if (text.trim().length > 0) {
							root.content.push(text);
						}
					} else {
						/* For any other node, just create an object to represent it */
						var newElem = {
							type: sourceElem.nodeName,
							content: [],
							attributes: {}
						};

						/* Copy attributes */
						var attr;
						var attributes = Array.prototype.slice.call(sourceElem.attributes);
						while(attr = attributes.pop()) {
							newElem.attributes[attr.nodeName] = attr.nodeValue;
						}

						root.content.push(newElem);
						var newElements = Array.from(sourceElem.childNodes)
						handleElements(newElem, newElements);
					}
				}
			}
			jsonObject = {content: []};
			handleElements(jsonObject, elements);

			/* Show the right elements */
			document.getElementById("blog-posts").classList.add("hidden");
			var postContainer = document.getElementById("post-container");
			postContainer.classList.remove("hidden");

			generatePage();

		} else {
			//Network Error of some kind, display a data corruption message
			/*
			document.getElementById("blog-posts").classList.add("hidden");
			var container = document.getElementById("post-container");
			container.classList.remove("hidden");
			var corruptionContainer = document.createElement("p");
			corruptionContainer.innerHTML = generateDataCorruption();
			container.innerHTML = "";
			container.appendChild(corruptionContainer);
			*/
		}
		document.getElementById("enter").play();
	}
	xhr.send(null);
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
	document.getElementById("hack-cursor2").className = "cursor-flash"
}
var addEntryCharacter = function() {
	if(currentText === targetText || currentText.length >= targetText){
		document.getElementById("hack-cursor2").className = "cursor-flash"
		return;
	}
	playKeyboardSound();
	var newText = currentText + targetText[currentText.length];
	currentText = newText;
	document.getElementById("entry").textContent = newText;
	var randomDelay = generateRandomInt(0,40);
	setTimeout(addEntryCharacter,30+randomDelay);
}
var setEntry = function(content){
	targetText = content;
	document.getElementById("entry").textContent = "";
	currentText = "";
	document.getElementById("hack-cursor2").className = "cursor-on"
	addEntryCharacter();
}

var setAttempts = function(){
	var text = attempts + " Attempt(s) Left:";
	document.getElementById("attemptstext").innerHTML = text;
	var blocks = "";
	for (i = 0; i < attempts; i++){
		blocks += " ██";
	}
	document.getElementById("attemptsblocks").innerHTML = blocks;

	if(attempts <= 1){
		document.getElementById("message").innerHTML = "!!! WARNING: LOCKOUT IMMINENT !!!<br> ​";
		document.getElementById("message").className = "blinker";
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
			enableMinigame = false;
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
				dudSpans[i].textContent = ".";
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

var addWord = function(symbolSpans, word){
	//Add each letter of the word we have selected to the column
	for(i = 0; i < word.length; i++){
		var newspan = document.createElement("SPAN");
		newspan.className = "word word-" + word;
		newspan.onclick = (function(newspan){ return function(){clicked(newspan);};})(newspan);
		newspan.onmouseleave = (function(newspan){ return function(){unhover(newspan);};})(newspan);
		newspan.onmouseenter = (function(newspan){ return function(){hover(newspan);};})(newspan);
		newspan.attributes["data-shouldbe"] = word.charAt(i);
		newspan.attributes["data-charpos"] = i;
		newspan.textContent = ""; //There's a zero width space here!
		symbolSpans.push(newspan);
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
	return wordClass.replace("word-","");
}

//Generate an Int between lower (inclusive) and upper (exclusive)
var generateRandomInt = function(lower, upper){
	return Math.floor(Math.random()*((upper-1)-lower+1)+lower);
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
		case "&lt;":
		closing_bracket = "&gt;";
		break;
		case "{":
		closing_bracket = "}";
		break;
		case "[":
		closing_bracket = "]";
		break;
		case "(":
		closing_bracket = ")";
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
		} else if(object.classList.contains( "word") ||
			      object.classList.contains("pointer") ||
			      object.innerHTML == ""){
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
var getSpanFromCoords = function() {
	var isright = hackingCursorX >= 12;
	var column = hackingCursorX % 12;
	if (isright) {
		return symbolSpansRight[hackingCursorY*12 + column];
	} else {
		return symbolSpansLeft[hackingCursorY*12 + column];
	}
}
var hover = function(span) {
	if(enableMinigame != true){
		return;
	}

	/* Unhighlight the old stuff */
	var highlights = document.querySelectorAll("#hacking .highlight");
	for(var h = 0; h < highlights.length; h++) {
		var highlight = highlights[h];
		if(highlight.classList.contains("bracketpair")) {
			hovercleanup(highlight);
		}
		unhover(highlight);
	}

	// Determine our new X and Y position
	if (symbolSpansRight.includes(span)) {
		var pos = symbolSpansRight.indexOf(span);
		hackingCursorX = 12 + (pos % 12);
		hackingCursorY = Math.floor(pos / 12);
	} else {
		var pos = symbolSpansLeft.indexOf(span);
		hackingCursorX = pos % 12;
		hackingCursorY = Math.floor(pos / 12);
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
		if (chr === '{' || chr === '[' || chr === '(' || span.innerHTML === "&lt;"){
			var returned = detectClosingBracket(span);
			var parent = span.parentNode;
			if(returned){
				span.removeAttribute("onclick");

				var newspan = document.createElement("SPAN");
				newspan.className = "bracketpair highlight";
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
		var classes = span.classList;
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
var generatePointerColumn = function(ptrSpans, value, isRight) {
	var count = 0;
	do{
		var newspan = document.createElement("SPAN");
		newspan.className = "pointer";
		newspan.textContent = ""; //There's a zero width space here!
		var leadingSpace = "";
		if(isRight) {
			leadingSpace = " ";
		}
		newspan.attributes["data-shouldbe"] = leadingSpace + convertToHex(value) + " ​";  //There's a zero width space here!
		ptrSpans.push(newspan);
		value += 12;
		count++;
	} while (count < 17);
}

//Generate a set of 12*17 symbols including words.
var generateSymbolColumn = function(symbolSpans) {
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
		newspan.attributes["data-shouldbe"] = symbols[generateRandomInt(0,symbols.length)];
		newspan.textContent = "";	//There's a zero width space here!
		symbolSpans.push(newspan);
		numsymbols++;

		//Choose to add a word or not
		if((symbolSpans.length + wordlength < 17*12)
			&& (numsymbols > 4)
			&& (numsymbols == 45 || (generateRandomInt(0,17) > 15))){

			//Select a random word
			var wordpos = generateRandomInt(0,allWords.length - 1);
			var word = allWords[wordpos];

			//Remove the word from the array so we don't put in duplicates
			allWords.splice(wordpos, 1);

			//Store the word with the words we have selected.
			words.push(word);

			//Generate the spans for the word
			addWord(symbolSpans, word);
			numsymbols = 0;
		}
	}
}

var hoverPost = function(span){
	/* Unhighlight the old stuff */
	var highlights = document.querySelectorAll("#blog-posts .highlight");
	for(var h = 0; h < highlights.length; h++) {
		unhoverPost(highlights[h]);
	}

	/* Determine the new cursor */
	postListCursor = [].indexOf.call(span.parentNode.children, span);

	span.classList.add("highlight");
	printCount = 0;
	playPrintBeep();
};
var unhoverPost = function(span){
	span.classList.remove("highlight");
};

var generatePostSelection = function(page){
	var container = document.getElementById("blog-posts");
	/* Remove all existing children */
	while (container.lastChild) {
        container.removeChild(container.lastChild);
    }

	/* Max number of posts to put on this page */
	var numposts = 8;
	if (page === 0) {
		numposts = 9;
	}

	/* Beginning index for posts for this page */
	var index = 0;
	if (page > 0) {
		index += 9;
		index += (page - 1) * 8;

		var previous = document.createElement("p");
		previous.textContent = "[Previous]";
		previous.trigger = function(){
			generatePostSelection(page-1);
			postListCursor = null;
		};
		previous.addEventListener('click', previous.trigger);
		previous.addEventListener('mouseenter', (function(newspan){return function(){hoverPost(newspan);};})(previous));
		previous.addEventListener('mouseleave', (function(newspan){return function(){unhoverPost(newspan);};})(previous));
		container.appendChild(previous);
	}

	for(var i = index;i < index + numposts; i++) {
		var post = posts[i];
		var p = document.createElement("p");
		p.textContent = "[" + post.date + " " + post.title + "]";
		p.trigger = (function(url){ return function(){viewPost(url)}})(post.url);
		p.addEventListener('click', p.trigger);
		p.addEventListener('mouseenter', (function(newspan){return function(){hoverPost(newspan);};})(p));
		p.addEventListener('mouseleave', (function(newspan){return function(){unhoverPost(newspan);};})(p));
		container.appendChild(p);
	}

	if (index + numposts < posts.length) {
		var next = document.createElement("p");
		next.textContent = "[Next]";
		next.trigger = function(){
			generatePostSelection(page+1);
			postListCursor =  null;
		};
		next.addEventListener('click', next.trigger);
		next.addEventListener('mouseenter', (function(newspan){return function(){hoverPost(newspan);};})(next));
		next.addEventListener('mouseleave', (function(newspan){return function(){unhoverPost(newspan);};})(next));
		container.appendChild(next);
	}
}


var login = function() {
	document.getElementById("hacking").classList.add("hidden");
	document.getElementById("loggedin").classList.remove("hidden");
	//window.addEventListener("load", resizeLoggedIn, false);
	//window.addEventListener("resize", resizeLoggedIn, false);
	//resizeLoggedIn();

	//Display today's date
	var d = new Date();
	var year = d.getFullYear() + 60;
	var month = "0" + (d.getMonth()+1);
	month = month.substr(month.length-2);
	var day = "0" + d.getDate();
	day = day.substr(day.length-2);
	document.getElementById("todays-date").textContent = year + "-" + month + "-" + day;

	generatePostSelection(0);
	enableMinigame = false;
	enablePosts = true;

	//Play login sound
	document.getElementById("login").play();
};

var turnOnCursor = function(cursor) {
	cursor.className = "cursor-on";
}

var turnOffCursor = function(cursor) {
	cursor.className = "cursor-off";
}

var flashCursor = function (cursor) {
	cursor.className = "cursor-flash";
};

var typingEnter = function () {
	document.getElementById("enter").play();
};

var printCount = 0;
var playPrintBeep = function(){
	if(printCount == 0) {
		document.getElementById("print").play();
	}
	printCount += 1;
	if (printCount > 4) {
		printCount = 0;
	}
};

var playKeyboardSound = function() {
	var soundID = generateRandomInt(1,8);
	var sound = document.getElementById("key" + soundID);
	sound.currentTime = 0;
	sound.play();
};

var printText = function(messages, stopPrinting, callback, withCursor) {

	if(messages.length === 0) {
		callback();
		return;
	}

	var messageIndex = 0;
	var textIndex = 0;
	var message = messages[messageIndex];
	var text = message.text;

	var target;
	if (message.targetId) {
		target = document.getElementById(message.targetId);
	} else {
		target = message.target;
	}

	var cursor;
	if (message.cursorId) {
		cursor = document.getElementById(message.cursorId);
	} else {
		cursor = message.cursor;
	}

	if (withCursor) {
		target.classList.add("activeCommandPrompt");
		turnOnCursor(cursor);
	}

	var delay = message.delay;

	printCount = 0;

	var handleChar = function() {
		/* If it's a linebreak, print all in one go */
		if (message.isBreak) {
			target.innerHTML = target.innerHTML + text;
			textIndex = text.length - 1;
		}

		/* Human or Machine type a character */
		if (message.isMachine) {
			target.innerHTML = target.innerHTML + text[textIndex];
			playPrintBeep();
		} else if (message.isHuman) {
			target.innerHTML = target.innerHTML + text[textIndex];
			playKeyboardSound();
		}

		/* Print the next character if there is one */
		if (textIndex < text.length - 1) {
			textIndex++;
			return printChar();
		}

		/* Else, print the next message */
		if (messageIndex < messages.length - 1) {
			messageIndex++;
			message = messages[messageIndex];

			if (withCursor) {
				turnOffCursor(cursor);
				target.classList.remove("activeCommandPrompt");
			}

			if (message.targetId) {
				target = document.getElementById(message.targetId);
			} else {
				target = message.target;
			}

			if (message.cursorId) {
				cursor = document.getElementById(message.cursorId);
			} else {
				cursor = message.cursor;
			}

			if (withCursor) {
				target.classList.add("activeCommandPrompt");
				turnOnCursor(cursor);
			}

			text = message.text;
			textIndex = 0;
			printCount = 0;
			/* If we're human, add a delay to simulate thinking */
			interMessageDelay = 0;
			if (message.isHuman) {
				interMessageDelay = 500 + generateRandomInt(0,800);
				if (withCursor) {
					target.classList.add("activeCommandPrompt");
					flashCursor(cursor);
				}
			}

			if (!window[stopPrinting]) {
				setTimeout(function() {
					return printChar();
				}, interMessageDelay);
			} else {
				return printChar();
			}

		}

		if (messageIndex === messages.length - 1
			&& textIndex === text.length - 1) {
			if (withCursor) {
				turnOffCursor(cursor);
				target.classList.remove("activeCommandPrompt");
			}
			callback();
		}
	}

	var printChar = function() {

		var randomDelay = 0;
		if (message.isHuman) {
			randomDelay = generateRandomInt(0,40);
		}

		if (!window[stopPrinting]) {
			setTimeout(function() {
				handleChar();
			},delay + randomDelay);
		} else {
			handleChar();
		}

	}

	printChar();
}

var printCommandPrompt = function(){
	printText(commandPromptText, "finishedPrinting", function(){setTimeout(beginMinigame,700)}, true);
};

function skipMinigamePrint() {
	document.removeEventListener("click", skipMinigamePrint);
	if (enableMinigame) {
		return;
	}
	enableMinigame = true;
}
var printMinigame = function() {
	var messages = minigameText;

	document.addEventListener("click", skipMinigamePrint);

	for (var i = 0; i < 17; i++){
		var cursor = cursors[i];

		var leftptr = pointerSpansLeft[i];
		messages.push({text:leftptr.attributes["data-shouldbe"], isMachine:true, delay:4, target:leftptr, cursor:cursor});

		for (var j = 0; j < 12; j++) {
			var leftsymb = symbolSpansLeft[i*12 + j];
			messages.push({text:leftsymb.attributes["data-shouldbe"], isMachine:true, delay:4, target:leftsymb, cursor:cursor});
		}

		var rightptr = pointerSpansRight[i];
		messages.push({text:rightptr.attributes["data-shouldbe"], isMachine:true, delay:4, target:rightptr, cursor:cursor});

		for (var j = 0; j < 12; j++) {
			var rightsymb = symbolSpansRight[i*12 + j];
			messages.push({text:rightsymb.attributes["data-shouldbe"], isMachine:true, delay:4, target:rightsymb, cursor:cursor});
		}

		var space = spaces[i];
		messages.push({text:" ​", isMachine:true, delay:4, target:space, cursor:cursor});
	}

	printText(messages, "enableMinigame", function(){
		setTimeout(function() {
			//This is the last thing we do
			//Display the prompt and beep
			document.getElementById("minigame-prompt").classList.remove("hidden");
			document.removeEventListener("click", skipMinigamePrint);
			printCount = 0;
			playPrintBeep();
			//Enable the functionality!
			enableMinigame = true;
			minigameStarted = true;
		},4)
	}, true);
};

var beginMinigame = function() {
	if(minigameSetupBegun == true){
		return false;
	}
	minigameSetupBegun = true;
	document.getElementById("loading").classList.add("hidden");
	document.getElementById("hacking").classList.remove("hidden");
	printMinigame();
};

var finishPreload = function() {
	generateSymbolColumn(symbolSpansLeft);
	generateSymbolColumn(symbolSpansRight);
	var container = document.getElementById("hacking-symbols");
	for(var i = 0; i < 17; i++) {
		container.appendChild(pointerSpansLeft[i]);

		for (var j = 0; j < 12; j++) {
			container.appendChild(symbolSpansLeft[i*12 + j]);
		}

		container.appendChild(pointerSpansRight[i]);

		for (var j = 0; j < 12; j++) {
			container.appendChild(symbolSpansRight[i*12 + j]);
		}

		var space = document.createElement("SPAN");
		space.textContent = "";
		container.appendChild(space);
		spaces.push(space);

		var cursor = document.createElement("SPAN");
		cursor.textContent = "█";
		cursor.classList.add("cursor-off");
		container.appendChild(cursor);
		cursors.push(cursor);

		var brk = document.createElement("BR");
		container.appendChild(brk);
	}
	insertGoal();
	finishedLoading = true;
}
var presetWords = function () {
	//Fall back to predefined set of words
	goalWord = "BONFIRE";
	allWords = ["FALLACY","REPATCH","SWELTER","PROMOTE","SOURCES","PREWORN","DUALITY",
		"VOIDING","BOBBIES","COPPICE","BANDITO","BOILERS","BOXLIKE","CONFORM","CONFIRM",
		"CONFIDE","GUNFIRE","FOXFIRE","CONFINE"];
	wordlength = 7;
	finishPreload();
}
function skipBeforeXHR() {
	if(!clickedBegin) {
		return;
	}
	document.removeEventListener("click", skipBeforeXHR);
	presetWords();
	window.finishedPrinting = true;
	beginMinigame();
}
function skipPrompt() {
	if(window.finishedPrinting) {
		document.removeEventListener("click", skipPrompt);
		return;
	}
	document.removeEventListener("click", skipBeforeXHR);
	document.removeEventListener("click", skipPrompt);
	window.finishedPrinting = true;
	beginMinigame();
}
function skipPromptClick(e) {
	if(e.cancel) {
		return;
	}
	skipPrompt();
}
var addSkipEvent = function () {
	document.addEventListener("click", skipPromptClick);
}
var preloadHacking = function() {
	//Generate the pointers
	var value = Math.floor(Math.random() * 65128);
	generatePointerColumn(pointerSpansLeft, value, false);
	generatePointerColumn(pointerSpansRight, value+204, true);

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
			addSkipEvent();
		} else if(xhr.readyState == XMLHttpRequest.DONE) {
			//Some kind of network error
			presetWords();
			addSkipEvent();
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

		span.attributes["data-shouldbe"] = goalWord[position];
	}
};

var turnOnClick = function(e) {
	e.cancel = true;
	turnOn();
}
var turnOn = function() {
	clickedBegin = true;
	document.removeEventListener("click", turnOnClick);
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
	document.getElementById("please-rotate").classList.add("hidden");
	document.getElementById("click-to-start").classList.add("hidden");
	//Show the command prompt thing
	document.getElementById("loading").classList.remove("hidden");

	document.addEventListener("click", skipBeforeXHR);
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
  return;
  /* Since adding the terminal 'model', we no longer need to force them to be full screen. */
  /*
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }
  }
  */
}

document.addEventListener("keydown", event => {
	/* Ignore IME Composition */
	if (event.isComposing || event.keyCode === 229) {
	return;
	}

	if (!clickedBegin) {
		if (event.code === 'Enter' || event.code === 'Space') {
			turnOn();
		}
		return;
	}

	if (!minigameSetupBegun) {
		if (event.code === 'Enter' || event.code === 'Space') {
			if (goalWord === "") {
				skipBeforeXHR();
			} else {
				skipPrompt();
			}
		}
		return;
	}

	if (!minigameStarted) {
		if (event.code === 'Enter' || event.code === 'Space') {
			skipMinigamePrint();
		}
		return;
	}

	if (minigameStarted && enableMinigame) {
		var highlight = document.querySelector("#hacking .highlight");
		if (event.code === 'Enter' || event.code === 'Space') {
			if (highlight) {
				clicked(highlight);
			}
		}

		if ((hackingCursorX === null || hackingCursorY === null) &&
			(event.code === 'KeyA' || event.code === 'ArrowLeft' ||
			 event.code === 'KeyD' || event.code === 'ArrowRight' ||
			 event.code === 'KeyW' || event.code === 'ArrowUp' ||
			 event.code === 'KeyS' || event.code === 'ArrowDown')) {
			hackingCursorX = 0;
			hackingCursorY = 0;
		} else if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
			hackingCursorX = Math.max(hackingCursorX - 1, 0);
			if (highlight.classList.contains("word")) {
				var span = getSpanFromCoords();
				while (span.classList.contains("word") && hackingCursorX > 0) {
					hackingCursorX = Math.max(hackingCursorX - 1, 0);
					span = getSpanFromCoords();
				}
			}
		} else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
			hackingCursorX = Math.min(hackingCursorX + 1, 23);
			if (highlight.classList.contains("word")) {
				var span = getSpanFromCoords();
				while (span.classList.contains("word") && hackingCursorX < 23) {
					hackingCursorX = Math.min(hackingCursorX + 1, 23);
					span = getSpanFromCoords();
				}
			}
		} else if (event.code === 'KeyW' || event.code === 'ArrowUp') {
			hackingCursorY = Math.max(hackingCursorY - 1, 0);
		} else if (event.code === 'KeyS' || event.code === 'ArrowDown') {
			hackingCursorY = Math.min(hackingCursorY + 1, 16);
		} else {
			return;
		}

		hover(getSpanFromCoords());
	}

	if (enablePosts) {
		var highlight = document.querySelector("#blog-posts .highlight");
		if (event.code === 'Enter' || event.code === 'Space') {
			if (highlight) {
				highlight.trigger();
			}
		}

		var postsList = document.getElementById("blog-posts");
		var postsLength = postsList.children.length;

		if (event.code === 'KeyW' || event.code === 'ArrowUp') {
			if (postListCursor === null) {
				postListCursor = postsLength - 1;
			} else {
				postListCursor = Math.min(Math.max(postListCursor - 1, 0), postsLength - 1);
			}
		} else if (event.code === 'KeyS' || event.code === 'ArrowDown') {
			if (postListCursor === null) {
				postListCursor = 0;
			} else {
				postListCursor = Math.max(Math.min(postListCursor + 1, postsLength - 1), 0);
			}
		} else {
			return;
		}

		var span = postsList.children[postListCursor];

		hoverPost(span);
	}

	if (enablePost) {
		if (event.code === 'Enter' || event.code === 'Space') {
			if (window.finishedPrinting) {
				nextPage();
				document.removeEventListener("click",nextPageClick);
			} else {
				window.finishedPrinting = true;
				document.removeEventListener("click",skipPrinting);
			}
		}
	}
});

document.getElementById("effects-wrapper").className = "terminal-off";
document.body.onselectstart = function() { return false };
preloadHacking();
document.addEventListener("click", turnOnClick);

//TODO: Testing only so I don't hear the sound
//mute();