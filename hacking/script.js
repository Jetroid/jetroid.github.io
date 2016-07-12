var words = [];
var goalWord = "";
var attempts = 4;
var hadRefresh = false;
var clickedBrackets = new Set();
var terminalLocked = false;
var currentPost = null;

var tickNoise = function(){
	document.getElementById("tick").currentTime = 0;
	document.getElementById("tick").play();
}
var viewPost = function(postID){
	document.getElementById("post-titles-container").style.display="none";
	document.getElementById(postID).style.display="block";
	//simple-scrollbar creates two nested elements inside our container.
	//The second nested child is the one which scrolls - reset it to the top
	var scrollingElement = document.getElementById(postID).firstChild.firstChild;
	scrollingElement.scrollTop = 0;
	
	document.getElementById("enter").play();
	currentPost = postID;
}
var exitPost = function(){
	if(currentPost){
		document.getElementById(currentPost).style.display="none";
		document.getElementById("post-titles-container").style.display="block";
		document.getElementById("enter").play();
		currentPost = null;
	}
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
	document.getElementById("entry").innerHTML = "<br>> <span id=\"flasher\">█<span>";
	document.getElementById("key2").play();
}
var setEntry = function(span){
	var content = span.innerHTML.replace(/<br>/g,"");
	var content = content.replace(/<s.*?>|<\/s.*?>/g,"");
	for(i = 0; i < content.length; i++){
		setTimeout(function() {
			var key = "key" + generateRandomInt(1,12);
			if(document.getElementById(key) != null){
				document.getElementById(key).play();
			}
		}, i * 50);
	}
	document.getElementById("entry").innerHTML = "<br>>" + content
	+ "<span id=\"flasher\">█<span>";
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
			for(i = 0; i < 5; i++){
				if(goalWord.charAt(i) == word.charAt(i)) correct++;
			}
			addFeedback(">Entry Denied");
			addFeedback(">"+ correct + "/5 correct.");
			attempts--;
			setAttempts();
		}else{
			terminalLocked = true;
			document.getElementById("correct").play();
			addFeedback(">Exact match!");
			addFeedback(">Please wait");
			addFeedback(">while system");
			addFeedback(">is accessed.");
			setTimeout(function() {
				document.getElementById("hacking").style.display="none";
				document.getElementById("loggedin").style.display="block";
				window.addEventListener("load", resizeLoggedIn, false);
				window.addEventListener("resize", resizeLoggedIn, false);
				resizeLoggedIn();
				//Play login sound
				document.getElementById("login").play();
			}, 2000);
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
	return Math.floor(Math.random() * (upper+lower))+lower;
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
	var wordslength = 5;
	var array = five; //Copy the array
	var count = 0;
	var numsymbols = 0;
	while (count < 17*12) {
		string += "<span class='symbol' onmouseover=\"hoversym(this)\" onclick=\"clicked(this)\">" 
		+ symbols[generateRandomInt(0,symbols.length)] + " </span>";
		count++;
		numsymbols++;
		
		//Choose to add a word
		if((count + wordslength < 17*12) 
			&& (numsymbols > 4)
			&& (numsymbols == 45 || (generateRandomInt(0,17) > 15))){
			
			//Select a random word
			var wordpos = generateRandomInt(0,array.length);
			var word = array[wordpos];
			
			//Remove the element from the array
			array.splice(wordpos, 1);
			
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

window.onload = function(){
	//Generate the pointers
	var value = Math.floor(Math.random() * 65128);
	var pcolumn = generatePointerColumn(value);
	document.getElementById("leftpointers").innerHTML = pcolumn;
	var pcolumn = generatePointerColumn(value+204);
	document.getElementById("rightpointers").innerHTML = pcolumn;

	//Generate the symbols 

	//We should have the array 'five' loaded in, which contains every 5 lettered english word.
	var column = generateSymbolColumn();
	document.getElementById("leftsymbols").innerHTML = column;
	var column = generateSymbolColumn();
	document.getElementById("rightsymbols").innerHTML = column;

	//Select the goal word
	var selectedWord = generateRandomInt(0, words.length);
	goalWord = words[selectedWord];
	words.splice(selectedWord, 1);

	//Play login sound
	document.getElementById("login").play();
	resizeLoggedIn();
}
