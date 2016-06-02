//We will have 2 columns, each with 17 rows, each containing 12 characters.
//We want to generate a hex pointer for each row. Each row is 12d higher than the previous.
//The maximum row should not exceed 65535 (FFFF). The final row will be 408 higher than the first.
//Therefore we want to generate a starting value between 0 (inclusive) and 65127 (inclusive)
var getStartingValue = function(){
	return Math.floor(Math.random() * 65128);
}

//Convert to Hex and pad to 4 chars. Prepend with '0x'
var convertToHex = function(d){
	var hex = Number(d).toString(16).toUpperCase();
	while (hex.length < 4) {
		hex = "0" + hex;
	}
	return "0x" + hex;
}

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

//Generate an Int between lower (inclusive) and upper (exclusive)
var generateRandomInt = function(lower, upper){
	return Math.floor(Math.random() * (upper+lower))+lower;
}

var generateSymbolColumn = function() {
	var symbols = ["!","\"","£","$","%","^","&","*","(",")",
			"-","_","+","=","{","[","}","]",":",";",
			"@","\'","~","#","<",">",",",".","?","/",
			"|","\\","`"]
	var string = "";
	var count = 0;
	do{
		for(i = 0; i < 12; i++){
			string += symbols[generateRandomInt(0,symbols.length)];
		}
		string += "<BR/>";
		count++;
	} while (count < 17);
	return string;
}

var value = getStartingValue();
var pcolumn = generatePointerColumn(value);
document.getElementById("leftpointers").innerHTML = pcolumn;
var pcolumn = generatePointerColumn(value+204);
document.getElementById("rightpointers").innerHTML = pcolumn;

//We should have the array 'five' loaded in, which contains every 5 lettered english word.
var column = generateSymbolColumn();
document.getElementById("leftsymbols").innerHTML = column;
var column = generateSymbolColumn();
document.getElementById("rightsymbols").innerHTML = column;
