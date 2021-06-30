/* Generate a random int between lower (inclusive) and upper (exclusive) */
var rint = function(lower, upper){
	return Math.floor(Math.random()*((upper+1)-lower+1)+lower);
};
var rspikes = function(lower, upper, proportion) {
	var value = Math.random() <= proportion ? rint(upper/2, upper) : rint(lower, upper/2);
	return value;
}
var factor = 1;
var drawIndex = 4;
var randomDraw;
/* Returns an array of tuples, [leftEdge, rightEdge, topEdge, bottomEdge] */
var findTextBoundaries = function(element) {
	/* We want to go know where each line begins and ends:
	We'll figure this out by adding each word one at a time,
	and then checking if the xoffset of each word is less than the previous,
	which indicates that the word began a new line */
	var saved = element.innerHTML;
	var lines = element.innerHTML.split(/<br *\/?>/);
	element.innerHTML = "";
    /* Recreate the innertext but with each word in it's own span */
    var spans = [];
	for (var line in lines) {
		var words = lines[line].trim().split(/ +/);
		for (var word in words) {
			var span = document.createElement("SPAN");
			span.innerHTML = words[word] + " ";
			spans.push(span);
			element.appendChild(span);
		}
		// For some unknown reason the BR is appended into a span????
		element.appendChild(document.createElement("BR"));
	}

	/* We can now measure the position of each span and compare it to it's predecessor
	to determine where lines of text begin and end */
	var previousSpanEnd = null;
	var previousSpanTop = null;
	var textIndexes = [];
	for (var span in spans) {
		var spanStart = spans[span].offsetLeft;
		var spanEnd = spanStart + spans[span].offsetWidth;
		var spanTop = spans[span].offsetTop;
		var spanBottom = spanTop + spans[span].offsetHeight;
		if (previousSpanEnd === null) {
			textIndexes.push([spanStart, null, spanTop, spanBottom]);
		} else if (spanTop > previousSpanTop ) {
			textIndexes[textIndexes.length - 1][1] = previousSpanEnd;
			textIndexes.push([spanStart, null, spanTop, spanBottom]);
		}
		previousSpanTop = spanTop
		previousSpanEnd = spanEnd;
	}
	if(textIndexes.length) {
		textIndexes[textIndexes.length - 1][1] = previousSpanEnd;
	}
	/* Sometimes a span's x values can be negative, so let's correct that */
	/* Determine the largest negative value */
	var minimumIndex = 0;
	for (var i in textIndexes) {
		var index = textIndexes[i];
		minimumIndex = Math.min(index[0],minimumIndex)
	}
	/* Add the absolute size of the largest negative to all x values */
	minimumIndex = Math.abs(minimumIndex);
	for (var i in textIndexes) {
		var index = textIndexes[i];
		index[0] += minimumIndex;
		index[1] += minimumIndex;
		index.push(minimumIndex);
	}
	element.innerHTML = saved;
	return textIndexes;
}
/* Determine which lines we should draw on for a given x
	Useful when drawing vertical lines. */
var checkDepth = function(textIndexes, x) {
	var topDepth = textIndexes.length - 1;
	var bottomDepth = 0;
	/* Create an array showing if we should cover each line of text*/
	var textCovers = [];
	for (var j = 0; j < textIndexes.length; j++) {
		textCovers.push(textIndexes[j][0] <= x && textIndexes[j][1] >= x);
	}

	for (var j = 0; j < textCovers.length; j++) {
		if (textCovers[j]) {
			bottomDepth = j;
		}
		if (textCovers[textCovers.length-1 - j]) {
			topDepth = textCovers.length-1 - j;
		}
	}
	return [topDepth, bottomDepth];
}
var lineLength = function(lineStartX, lineStartY, lineEndX, lineEndY) {
	var dx = Math.abs(lineEndX - lineStartX);
	var dy = Math.abs(lineEndY - lineStartY);
	return Math.sqrt(dx*dx + dy*dy);
}
var drawBackground = function(title) {
	/* We provide some margin so that the paint can splash around */
	var marginX = Math.min(title.offsetWidth,200);
	var marginY = title.offsetHeight;
	var mywidth = title.offsetWidth + 2*marginX;
	var myheight = title.offsetHeight + 2*marginY;

	var titleStyle = window.getComputedStyle(title);
	var paddingX = parseFloat(titleStyle.getPropertyValue("padding-left")) +
						parseFloat(titleStyle.getPropertyValue("padding-right"));
	var paddingY = parseFloat(titleStyle.getPropertyValue("padding-top")) +
						parseFloat(titleStyle.getPropertyValue("padding-bottom"));
	var rawwidth = title.offsetWidth - paddingX;
	var rawheight = title.offsetHeight - paddingY;

	var marL = marginX;
	var marR = mywidth - (title.offsetLeft + rawwidth) - marginX;
	var marT = marginY;


	var rawarea = rawwidth * rawheight;

	var textIndexes = findTextBoundaries(title);
	var numLines = textIndexes.length;
	var lineHeight = rawheight / numLines;
	marL -= textIndexes[0][4];

	var noAnimate = false;
	var totalDuration = 2;
	/* Options for customization */
	var brushstrokeOptions = {
		width: mywidth,
		height: myheight,
		animation: "points",
		root: title,
		color: "#94cbc4",
		queue: true,
		inkAmount: 6 + rawarea/20000,
		splashing: true,
		frameAnimation: true,
		tension: 1
	};

	/* Initialization */
	var bs = new Brushstroke(brushstrokeOptions);
	var canvas = title.lastElementChild;
	canvas.style.left = "-" + marginX + "px";
	canvas.style.top = "-" + marginY + "px";

	var drawingtype = drawIndex;
	if (randomDraw !== undefined) {
		drawIndex = (drawIndex + 1) % 6;
	}

	lines = [];
	totalLength = 0;
	if (drawingtype === 0) {
		/* This style swipes right then left then right again */
		var size = lineHeight * 2 + rint(0,6);
		var firstLineWidth = textIndexes[0][1] - textIndexes[0][0];
		var offset = Math.min(Math.sqrt(firstLineWidth), 60);
		var endX = marL + textIndexes[0][0] - offset;
		var endY = marT;
		for (var i = 0; i < numLines; i++) {
			var startX = endX
			var startY = endY + lineHeight*0.1;
			endX = marL + textIndexes[i][1] + 10 + rint(0,3);
			endX = i+1 < numLines ? Math.max(endX, marL + textIndexes[i+1][1] + 10 + rint(0,3)): endX;
			endY = marT + textIndexes[i][3] - lineHeight*0.4 + rint(-2,3);
			length = lineLength(startX, startY, endX, endY);
			totalLength += length;
			area = length * size;
			var inkAmount = 0.45*Math.exp(0.0000108*area);
			lines.push({
				points: [ startX, startY, endX, endY ],
				size: size,
				inkAmount: inkAmount,
				length: length
			});

			startX = endX;
			startY = endY + lineHeight*0.1;
			endX = marL + textIndexes[i][0] - 10 + rint(0,3);
			endX = i+1 < numLines ? Math.min(endX, marL + textIndexes[i+1][0] - 10 + rint(0,3)): endX;
			endY = marT + textIndexes[i][3] + rint(0,3);
			endY = numLines === 1 ? endY - lineHeight * 0.4 : endY;
			length = lineLength(startX, startY, endX, endY);
			totalLength += length;
			area = length * size;
			var inkAmount = 0.45*Math.exp(0.0000108*area);
			lines.push({
				points: [ startX, startY, endX, endY ],
				size: size,
				inkAmount: inkAmount,
				length: length
			});
		}
		/* The last line is special */
		var startX = endX
		var startY = endY;
		var endX = marL + textIndexes[numLines - 1][1] + offset + rint(0,3);
		var endY = marT + rawheight + rint(0,3);
		var length = lineLength(startX, startY, endX, endY);
		totalLength += length;
		area = length * size;
		var inkAmount = 0.45*Math.exp(0.0000108*area);
		lines.push({
			points: [ startX, startY, endX, endY ],
			size: size,
			inkAmount: inkAmount,
			length: length
		});
	} else if (drawingtype === 1) {
		/* This style draws a horizontal line for each line */
		for (var i = 0; i < numLines; i++) {
			/* First stroke is delayed */
			var delay = (i === 0) ? 0.5 : 0.1;
			var textIndex = textIndexes[i];
			var startX = marL + textIndex[0] - 15 + rint(0,10);
			var startY = marT + lineHeight * (i + 0.5) - 2 + rint(0,5);
			var endX = marL + textIndex[1] + 15 - rint(0,10);
			var endY = marT + lineHeight * (i + 0.5) - 3 + rint(0,7);
			var length = lineLength(startX, startY, endX, endY);
			totalLength += length;
			var size = lineHeight*2.5 + rint(0,6);
			var lineArea = size * (length + size);
			var inkAmount = 0.75*Math.exp(0.0000066*lineArea);
			lines.push({
				points: [ startX, startY, endX, endY ],
				size: lineHeight*2.5 + rint(0,6),
				inkAmount: inkAmount,
				length: length
			});
		}
	} else if (drawingtype === 2) {
		/* This style zigzags up and down from left to right */
		var size = lineHeight + rint(0,6);
		var xOffset = lineHeight / 2;
		var xRandom = Math.floor(xOffset / 10);
		var yOffset = lineHeight / 8;
		var yRandom = Math.floor(yOffset / 10);
		var zigzags = Math.ceil(rawwidth / xOffset);
		var xPad = -((zigzags * xOffset) - rawwidth)/2
		var duration = 0.04;
		var init = checkDepth(textIndexes, 0);
		var topDepth = init[0];
		var bottomDepth = init[1];
		for (var i = xPad; (i <= rawwidth + xPad); i+=2*xOffset) {
			/* First stroke is delayed */
			/* Whichever is lower for topDepth and higher for bottomDepth */
			var depths0 = checkDepth(textIndexes, i);
			var depths1 = checkDepth(textIndexes, i + 2*xOffset);
			var depths2 = checkDepth(textIndexes, i + 1*xOffset);
			var depths3 = checkDepth(textIndexes, i + 3*xOffset);
			/* Stroke to bottom right */
			/* Start from last time's depth to prevent disjointedness */
			var startX = marL + i + rint(0,xRandom);
			var startY = marT + lineHeight * (topDepth) - yOffset + rint(0,yRandom);

			/* Determine the correct depths now */
			bottomDepth = Math.max(depths0[1], depths1[1]);
			topDepth = Math.min(depths2[0], depths3[0]);

			var endX = marL + i + xOffset - rint(0,xRandom);
			var endY = marT + lineHeight * (bottomDepth + 1) + 2*yOffset + rint(0,yRandom);
			var length = lineLength(startX, startY, endX, endY);
			totalLength += length;
			var lineArea = size * (length + size);
			var inkAmount = 0.81*Math.exp(0.000065*lineArea);
			lines.push({
				points: [ startX, startY, endX, endY ],
				size: size,
				inkAmount: inkAmount,
				length: length
			});
			if (i + xOffset < rawwidth + xPad) {
				/* Stroke to top right */
				var startX = marL + i + xOffset + rint(0,xRandom);
				var startY = marT + lineHeight * (bottomDepth + 1) + 2*yOffset + rint(0,yRandom);
				var endX = marL + i + 2*xOffset - rint(0,xRandom);
				var endY = marT + lineHeight * (topDepth) + yOffset + rint(0,yRandom);
				var length = lineLength(startX, startY, endX, endY);
				totalLength += length;
				var lineArea = size * (length + size);
				var inkAmount = 0.8*Math.exp(0.000065*lineArea);
				lines.push({
					points: [ startX, startY, endX, endY ],
					size: size,
					inkAmount: inkAmount,
					length: length,
				});
			}
		}
	} else if (drawingtype === 3) {
		/* This style draws lines in a < shape */

		/* Always draw a line that slopes up for the first line */
		var startX = marL + textIndexes[0][0] - 10 + rint(0,5);
		var startY = marT + 0.75*lineHeight + rint(0,3);
		var endX = marL + textIndexes[0][1] - 5 + rint(0,11);
		var endY = marT - 2 + rint(0,3);
		var length = lineLength(startX, startY, endX, endY);
		totalLength += length
		lines.push({
			points: [ startX, startY, endX, endY ],
			size: size,
			inkAmount: 2 + (textIndexes[0][1] - textIndexes[0][0]) / 320,
			length: length
		});

		/* If exactly two lines, draw a horizontal line between them */
		if (numLines === 2) {
			startX = marL - 15 + rint(0,10);
			startY = marT + 0.5*rawheight - 2 + rint(0,5);
			endX = marL + rawwidth + 15 - rint(0,10);
			endY = marT + 0.5*rawheight - 3 + rint(0,7);
			length = lineLength(startX, startY, endX, endY);
			totalLength += length;
			lines.push({
				points: [ startX, startY, endX, endY ],
				inkAmount: 2 + (rawwidth) / 320,
				size: size,
				length: length
			});
		}
		/* If more than two lines, draw more lines in the middle */
		for (var i = 1; i < numLines - 1; i++) {
			var textIndex = textIndexes[i];
			if ( i < Math.floor(numLines/2)) {
				/* Draw a line sloping up */
				startX = marL + textIndex[0] - 10 + rint(0,5);
				startY = marT + (i+0.75)*lineHeight + rint(0,3);
				endX = marL + textIndex[1] - 5 + rint(0,11);
				endY = marT + (i+0.25)*lineHeight - 2 + rint(0,3);
				length = lineLength(startX, startY, endX, endY);
				totalLength += length;
				lines.push({
					points: [ startX, startY, endX, endY ],
					inkAmount: 2 + (textIndex[1] - textIndex[0]) / 320,
					size: size,
					length: length
				});
			} else if ( i === Math.floor(numLines/2)) {
				/* Draw a straight line */
				startX = marL + textIndex[0] - 15 + rint(0,10);
				startY = marT + lineHeight * (i + 0.5) - 2 + rint(0,5);
				endX = marL + textIndex[1] + 15 - rint(0,10);
				endY = marT + lineHeight * (i + 0.5) - 3 + rint(0,7);
				length = lineLength(startX, startY, endX, endY);
				totalLength += length;
				lines.push({
					points: [ startX, startY, endX, endY ],
					inkAmount: 2 + (textIndex[1] - textIndex[0]) / 320,
					size: size,
					length: length
				});
			} else {
				/* Draw a line sloping down */
				startX = marL + textIndex[0] - 10 + rint(0,5);
				startY = marT + (i+0.25)*lineHeight + rint(0,3);
				endX = marL + textIndex[1] - 5 + rint(0,11);
				endY = marT + (i+0.75)*lineHeight - 2 + rint(0,3);
				length = lineLength(startX, startY, endX, endY);
				totalLength += length;
				lines.push({
					points: [ startX, startY, endX, endY ],
					inkAmount: 2 + (textIndex[1] - textIndex[0]) / 320,
					size: size,
					length: length
				});
			}
		}
		/* Always draw a line that slopes down for the last line */
		startX = marL + textIndexes[textIndexes.length-1][0] - 10 + rint(0,5);
		startY = marT + rawheight - 0.75*lineHeight + rint(0,3);
		endX = marL + textIndexes[textIndexes.length-1][1] - 10 + rint(0,3);
		endY = marT + rawheight + rint(0,3);
		length = lineLength(startX, startY, endX, endY);
		totalLength += length;
		lines.push({
			points: [ startX, startY, endX, endY ],
			inkAmount: 2 + (textIndexes[textIndexes.length-1][1] - textIndexes[textIndexes.length-1][0]) / 160,
			length: length
		});
	} else if (drawingtype === 4) {
		/* This style draws straight vertical lines */
		var topDepth = 0;
		var bottomDepth = 0;
		var xOffset = lineHeight / 2;
		var draws = Math.ceil(rawwidth / xOffset);
		var xPad = ((draws * xOffset) - rawwidth)/2
		console.log(xPad);
		for (var i = -xPad; i <= (rawwidth) + xPad; i+= xOffset ) {
			var size = xOffset*2 + rint(0,3);

			var depths0 = checkDepth(textIndexes, i - 0.7*xOffset);
			var depths1 = checkDepth(textIndexes, i + 0.7*xOffset);
			topDepth = Math.min(depths0[0], depths1[0]);
			bottomDepth = Math.max(depths0[1], depths1[1]);
			var startX = marL + i - 5 + rint(-6,7);
			var startY = marT + (lineHeight * topDepth) - 3 - rspikes(0,lineHeight/5,0.5);
			var endX = marL + i - 5 + rint(-5,6);
			var endY = marT + (lineHeight * (bottomDepth+1)) + 3 + rspikes(0,lineHeight/5,0.5);
			var length = lineLength(startX, startY, endX, endY);
			totalLength += length
			var lineArea = size * (length + size);
			var inkAmount = 0.8*Math.exp(0.00005*lineArea);
			lines.push({
				points: [
					startX, startY,
					endX, endY
				],
				size: size,
				inkAmount: inkAmount,
				length: length
			});
		}
	} else if (drawingtype === 5) {
		/* Temporary drawing type that will replace type 1 */
		/* This does a kind of scribbling out effect.
		We imagine the canvas to be a pen drawing up and to the right
		(at a 45 angle from the horizontal plane)
		until it reaches the edge (which will differ based on the text)
		followed by a drawing down and to the left from wherever the previous
		line ended
		(the second line at a 67.5 angle from the horizontal plane)

		This is sketched below with angles labelled.

		                   +         +        +   ...  ------
		                 //        //       /             o /
		               / /       / /      /           67.5 /
		             /  /      /  /     /                 /
                   /   /     /   /    /                  /
                 /    /    /    /   /                   /
	           /     /   /     /  /                    /
	         /      /  /      / /                     /
	       /o45    //        //                      /
         +------  +         +   ...

		*/
		var deg45 = 45*(Math.PI/180);
		var deg67 = 67.5*(Math.PI/180);

		/* We want to determine which line is the leftmost line of text
		 that we will paint on the initial stroke.
		 We do this by calculating where the line would cross y=0 when following a 45degree
		 line. Whichever line of text's x crossing point is the lowest.
		 is the leftmost line of text. */
		var smallestX = Number.MAX_VALUE;
		var leftmostLine = 0;
		for (var t = 0; t < numLines; t++) {
			var textIndex = textIndexes[t];
			var startX = textIndex[0];
			var startY = textIndex[3];
			var endY = 0;
			var endX = startX + Math.tan(deg45) * startY;
			if (endX <= smallestX) {
				smallestX = endX;
				leftmostLine = t;
			}
		}

		var i = textIndexes[leftmostLine][0];
		var topLine = leftmostLine;
		var bottomLine = leftmostLine;
		var backlineStartX = Number.MAX_VALUE;
		var backlineEndX = i;
		var backlineEndY = textIndexes[bottomLine][3]-0.75*lineHeight;
		while (i <= rawwidth) {
			/* From the current position at the bottom of `bottomLine`,
			calculate where we cross the top of each line above,
			when travelling at a 45degree angle from the horizontal plane
			calculate where they cross the top of the start line,
			when following a 60degree line.
			Whichever crossing point is the furthest in x that does not exceed  */
			var lineStartX = backlineEndX;
			var lineStartY = backlineEndY;
			var lineEndX = 0;
			var lineEndY = 0;
			for (var j = 0; j <= bottomLine; j++) {
				var textIndex = textIndexes[j];
				var myLineEndY = textIndex[2];
				var opposite = Math.tan(deg45) * (lineStartY - myLineEndY);
				var myLineEndX = lineStartX + opposite;
				/* If the line goes past the furthest point of this line of text, truncate it
				and calculate where the Y should end up. */
				if (myLineEndX > textIndex[1]) {
					myLineEndX = textIndex[1] + 1;
					var adjacent = (myLineEndX - lineStartX) / Math.tan(deg45);
					myLineEndY = lineStartY - adjacent;
				}
				/* If the calculated crossing point is further than the start of
				our line of text, and also further than the line of text above,
				take the new values. */
				if (myLineEndX > textIndex[0] &&
					myLineEndX > lineEndX) {
					lineEndX = myLineEndX;
					lineEndY = myLineEndY;
					topLine = j;
				}
			}

			var length = lineLength(lineStartX, lineStartY, lineEndX, lineEndY);
			totalLength += length;
			var size = 0.41*length - 1.88;

			/* Forward Stroke */
			lines.push({
				points: [
					marL + lineStartX, marT + lineStartY,
					marL + lineEndX, marT + lineEndY
				],
				size: size,
				length: length
			});

			/* Now we do the back stroke, which is basically the same calculation as above but a bit different */
			backlineStartX = lineEndX;
			backlineStartY = lineEndY;
			/* We change the EndX in the for loop below */
			backlineEndX = Number.MAX_VALUE;
			backlineEndY = 0;
			/* Iterating from bottom line up */
			for (var j = numLines - 1; j >= topLine; j--) {
				var textIndex = textIndexes[j];
				/* When ending at the bottom of the current line,
				calculate the crossing point at our given angle */
				var myLineEndY = textIndex[3];
				var adjacent = (myLineEndY - backlineStartY) / Math.tan(deg67);
				var myLineEndX = backlineStartX - adjacent;

				/* If the line goes past the starting point of this line of text,
				(ie the backstroke goes too far to the left)
				truncate it and calculate where the Y should end up. */
				if (myLineEndX < textIndex[0]) {
					myLineEndX = textIndex[0] - 1;
					var opposite = (backlineStartX - myLineEndX) * Math.tan(deg67);
					myLineEndY = backlineStartY + opposite;
				}
				/* If the calculated crossing point is less than the end of
				our line of text, and also less than the line of text below,
				take the new values. */
				if (myLineEndX < textIndex[1] &&
					myLineEndX < backlineEndX) {
					backlineEndX = myLineEndX;
					backlineEndY = myLineEndY;
					bottomLine = j;
				}
			}
			/* If we weren't successful, just pick a value. */
			if (backlineEndX === Number.MAX_VALUE) {
				backlineEndX = myLineEndX;
				backlineEndY = myLineEndY;
			}

			var length2 = lineLength(backlineStartX, backlineStartY, backlineEndX, backlineEndY);
			totalLength += length2;
			var size2 = 0.41*length2 - 1.88;

			/* Backward Stroke */
			lines.push({
				points: [
					marL + backlineStartX, marT + backlineStartY,
					marL + backlineEndX, marT + backlineEndY
				],
				size: size2,
				length: length2
			});
			if (backlineEndX !== i) {
				i = backlineEndX;
			} else {
				/* Failsafe incase something goes wrong */
				i += 150;
			}
		}
	}
	/* Generate the durations for the lines based on their lengths. */
	for (var l in lines) {
		var line = lines[l];
		line.duration = (totalDuration / lines.length);
		line.frames = Math.ceil(line.duration*60);

		var points = line.points;

		console.log(line.length);

		/* Chromium has a bug where perfectly straight lines aren't rendered if
		linewidth is below 0.0625 (brushstroke lines often are).
		https://bugs.chromium.org/p/chromium/issues/detail?id=1162604
		So we make sure our lines aren't perfectly straight. */
		if (points[0] === points[2]) {
			points[2] = points[2] + 0.001;
		}
		if (points[1] === points[3]) {
			points[3] = points[3] + 0.001;
		}

		/* Delay the first line */
		if (l = 0) {
			line.delay = 10;
		}
		/* Make the last line drip */
		if (l = lines.length-1) {
			line.dripping = true;
		}
		bs.draw(line);
	}
	bs.promise = bs.promise.then(function(){console.log("Hello?");});

};