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

var generateColumn = function(value) {
	var count = 0;
	var string = "";
	do{
		string += convertToHex(value) + "<BR/>";
		value += 12;
		count++;
	} while (count < 17);
	return string;
}

var value = getStartingValue();
var column1 = generateColumn(value);
var column2 = generateColumn(value+204);
document.getElementById("leftpointers").innerHTML = column1;
document.getElementById("rightpointers").innerHTML = column2;

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}
