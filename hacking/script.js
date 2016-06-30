var addFeedback = function(feedback){
	var feedbackContent = document.getElementById("feedback").innerHTML;
	feedbackContent = feedbackContent.replace(/^.*?<br>/, "");
	feedbackContent += "> " + feedback + "<br>";
	document.getElementById("feedback").innerHTML = feedbackContent;
}

var goalWord = "";
var clicked = function(span){
	console.log("called");
	addFeedback(span.innerHTML.replace(/<br>| /g,""));
}

//Convert to Hex and pad to 4 chars. Prepend with '0x'
var convertToHex = function(d){
	var hex = Number(d).toString(16).toUpperCase();
	while (hex.length < 4) {
		hex = "0" + hex;
	}
	return "0x" + hex;
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

var addBreakIfNeeded = function(string, count){
	if(count != 0 && count % 12 == 0){
		string += "<BR/>";
	}
	return string;
}

var addWord = function(string, word, count){
	//Add each letter of the word we have selected to the column
	string += "<span class='word' onclick=\"clicked(this)\">";
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
var words = [];
var generateSymbolColumn = function() {
	var symbols = ["!","\"","`","$","%","^","&","*","(",")",
			"-","_","+","=","{","[","}","]",":",";",
			"@","\'","~","#","<",">",",",".","?","/",
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
			&& (numsymbols > 1)
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
	    }else if(object.innerHTML.match(/[A-Z]/g)
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
	var ugly_children = spantodelete.children;
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
	hovercleanup();
	var open_regex = /&lt; |[{\[\(] /g;
	//If touch an opening bracket
	if (span.innerHTML.match(open_regex)){
		var returned = detectClosingBracket(span);
		var parent = span.parentNode;
		if(returned){
			returned[0].removeAttribute("onclick");
			var newspan = document.createElement("SPAN");
			newspan.className = "bracketpair";
			console.log("before");
			newspan.onclick = function(){clicked(newspan)};
			console.log("after");
			parent.insertBefore(newspan, span);
			for (var i = 0; i < returned.length; i++) {
				parent.removeChild(returned[i]);
				newspan.appendChild(returned[i]);
			}
			spantodelete = newspan;
		}
	}
}

//
//PLEASE NOTE: WE DO NOT RETURN THE ARRAY. WE MAY ENCOUNTER REPEATED WORDS IN BOTH LISTS
//
//


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

//Generate the feedback panel
var feedbackPanel = "";
for(i = 0; i < 16; i++){
	feedbackPanel += "<br>";
}
document.getElementById("feedback").innerHTML = feedbackPanel;
