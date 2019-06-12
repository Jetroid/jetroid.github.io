---
layout: post
title: "A Comparison Of Text Resizing Libraries"
date: 2019-06-07 16:45:24 +0800
background: "resize-beauty.jpg"
background-color: "#FBC31F"
summary: "An honest appraisal of different text resizing libraries, including jquery-textfill, jquery-bigtext, fancy-textfill, and fitText."
categories:
 - "Tech"
 - "Reviews"
---
**I continually seem to need to make text fill the dimensions of it's parent when I'm working on a project. There are countless different JavaScript text fill libraries online. Until now I've blindly used one or another without properly understanding the differences. This is an honest comparison and appraisal of the features of some of these. I will endeavour to be unbiased in my review, though I should disclose that I [worked on](/i-hate-reading-big-text/) both `big-text.js` and `textfill.js` to remove jQuery (because I dislike jQuery).**
<style>
th {
	padding: 0px 1px 0px 1px;
}
.grades::after {
	content: "";
	clear: both;
	display: table;
}
.grades {
	margin-bottom: 1em;
}
.three-column {
	float: left;
	min-width: 33%;
	margin-top: 5px;
}
.three-column > b {
	left: 15px;
	position: relative;
}
.grade {
	list-style: none;
	padding: 0;
	margin: 0;
}
.grade li { 
	padding-left: 16px; 
}
.grade li::before {
	padding-right: 8px;
}
.exceptional li::before {
	content: '★';
}
#conclusion-table thead {
	font-size: smaller;
}
#conclusion-table tbody {
	font-size: smaller;
	white-space: nowrap;
}
.pass li::before {
	content: '✓';
}
.fail li::before {
	content: '✗';
}
#size-compare > tbody td{
	white-space: nowrap;
}
</style>
In this article, I will be examining the following libraries...

* <https://github.com/DanielHoffmann/jquery-bigtext/> as `jquery-bigtext`
* <https://github.com/BrOrlandi/big-text.js> as `big-text.js`
* <https://github.com/jquery-textfill/jquery-textfill> as `jquery-textfill`
* <https://github.com/Jetroid/textfill.js> as `textfill.js`
* <https://github.com/STRML/textFit> as `textFit`
* <https://github.com/fazouane-marouane/fancy-textfill> as `fancy-textfill-jquery` and `fancy-textfill.js` 

<!-- TODO: Fitty? FitText (Dave Rupert)? FlowType? -->

...for the following categories...

* [Dependencies & Installation Issues](#dependencies--installation-issues)
* [Resize Correctness](#resize-correctness)
* [Content & Functionality](#content--functionality)
* [Performance](#performance)
* [Download Size](#download-size)
* [Project Health](#project-health)

... and for each category, I will rate the libraries as 'Exceptional', 'Pass', or 'Fail'. Or you can skip the exploration and skip straight to the [conclusion](#conclusion).

# Dependencies & Installation Issues 

The names of these projects are pretty clear about their dependencies - `jquery-bigtext`, `jquery-textfill`, and `fancy-textfill-jquery` all require jQuery to function. The rest require no dependencies. That said, `fancy-textfill-jquery` has the sister script, `fancy-textfill.js`, a version without jQuery. This gives `fancy-textfill` users an option to use jQuery if they prefer to (or are using it in their project anyway), or use regular plain JavaScript if they prefer to stay lightweight. (If you want to, you can use jQuery selectors  to provide the element for the non-jquery libraries, but it's not the same as native support which is more powerful and allows you to use it with jQuery features like [method chaining](https://www.w3schools.com/jquery/jquery_chaining.asp).)

All studied packages are available to be used in browser or on NPM, with the exception of `jquery-bigtext` and `textFit`, which do not appear to be available on NPM. At the time of writing, trying to use `big-text.js` and `jquery-textfill` in the browser can have problems due to poor management of exporting to module managers. [This has been acknowledged (with a workaround)](https://github.com/BrOrlandi/big-text.js/issues/2) for `big-text.js`. `jquery-textfill` doesn't have problems when trying to include it alone, but it isn't perfectly behaved and errors out if you use the `big-text.js` workaround fix before including the `jquery-textfill` script. 

I created a [pull](https://github.com/BrOrlandi/big-text.js/pull/5) [requests](https://github.com/jquery-textfill/jquery-textfill/pull/70) to fix both problems, and simply used those new versions so I didn't have to the use the workaround at all.

<div class="grades">
	<div class="three-column">
		<b>Exceptional</b>
		<ul class="grade exceptional">
			<li>fancy-textfill-jquery</li>
			<li>fancy-textfill.js</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Pass</b>
		<ul class="grade pass">
			<li>jquery-bigtext</li>
			<li>textfill.js</li>
			<li>textFit</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Fail</b>
		<ul class="grade fail">
			<li>big-text.js</li>
			<li>jquery-textfill</li>
		</ul>
	</div>
</div>

# Resize Correctness

After installing all the projects, the first thing I was interested in was if these libraries produced the same font size values, and if not, how are those sizes different? Do some prefer to give integer font sizes, or do some give [floating point sizes?](https://stackoverflow.com/questions/20512805/does-floating-point-length-value-make-sense-on-pixel-unit). These libraries all do similar things, just with different implementations, so I was curious how that affected sizing. And if they were not consistent, I wanted to ask which values were 'correct'? 

I tested all libraries with two different scenarios: One where [the limiting factor is the width](/misc/textfill/width/) (300x200 pixel container, contents 'test'), and another where [height was the limiting factor](/misc/textfill/height/) (300x100 pixel container, contents 'test'). I found that they all produced similar results, but that there was inconsistency between them. I also think it's important to note that all libraries tested gave integer font sizes, which was a little disappointing.

For the width experiment, I found that both `jquery-bigtext` and `big-text.js` produced font sizes of 124px, `jquery-textfill`, `textfill.js` and `textFit` gave 125px, and both versions of `fancy-textfill` gave 122px. 

I think it is debatable about which of these font size values is correct, though I think 122px is completely wrong in all metrics, as there is a underflow of 7.12px, visible even to the eye! For this reason I think I will grade both versions of `fancy-textfill` as 'Fail'. 124px makes the span 2.34px smaller than the container, and 125px makes the inner span 0.05px bigger than the container (overflowing the container slighty). The perfect font-size that would fit with no underflow or overflow is somewhere between 124.98px and 124.99px.

Because 125px overflows the container, it is debatably 'wrong' - the goal of these libraries could be described as 'make the text as big as possible without overflowing the container'. That said, the 125px is much closer to the perfect font-size. Therefore, the question of which value is the 'correct value' depends on if you think these libraries should give the 'font size closest to the perfect value' or 'the biggest font size that fits inside with zero overflow'. I'll let you decide.

![Demonstration of the underflow of 122px and 124px (represented in yellow), and the overflow of the 125px (represented in red, but not visible because it is too small).]({{ site.url }}/assets/images/content/textfills-width-experiment.png)
*Demonstration of the underflow of 122px and 124px (represented in yellow), and the overflow of the 125px (represented in red, but not visible because it is too small). [Static Demo Here](/misc/textfill/width-demo/).*

For the height experiment, `jquery-bigtext` and `big-text.js` gave a font size of 80px, whilst the rest gave `89px`. The explanation for this is that the two BigText libaries have a `fontSizeFactor` setting that defaults to `0.8` - this setting is intended to provide additional space for letters like 'g' and 'Á' which overflow the line. Changing that setting to `0.89` makes BigText take the same sizes as the other libraries, so I can only see this as a point in BigText's favour, so I will grade it 'Exceptional' - and grade the remaining three as 'Pass'.

<div class="grades">
	<div class="three-column">
		<b>Exceptional</b>
		<ul class="grade exceptional">
			<li>jquery-bigtext</li>
			<li>big-text.js</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Pass</b>
		<ul class="grade pass">
			<li>jquery-textfill</li>
			<li>textfill.js</li>
			<li>textFit</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Fail</b>
		<ul class="grade fail">
			<li>fancy-textfill-jquery</li>
			<li>fancy-textfill.js</li>
		</ul>
	</div>
</div>

<small>P.S. I was curious if the `fontSizeFactor` was preventing the BigText libraries from reaching 125px in the width experiment, so I set `fontSizeFactor` to `0.89` again and retested, but the change had no effect. This makes sense, because width is the limiting factor, not height, and we don't need extra vertical space for accentuated characters in that scenario.</small>

# Content & Functionality

In this section, I'd like to look at how the different libraries react to different content, and some of the functionality they have.

## Automatic Linebreaks

If we have a long string on content in a roughly square textbox, it probably doesn't make sense for the library to resize our text to be a single line within the box; We probably want our library to insert linebreaks and resize the text too. 

![]({{ site.url }}/assets/images/content/textfills-correct-multiline.png)

This is the default behaviour for most of the libraries, **but `jquery-bigtext` and `big-text.js` do not support this, they only support manual linebreaks.**

[Demo Here](/misc/textfill/multiline/). 

## Manual Linebreaks

Sometimes, we may want to insert manual linebreaks (`<br />`) into our text so that it appears on multiple lines.

![]({{ site.url }}/assets/images/content/textfills-correct-linebreaks.png)

This is supported by all libraries, with the exception of `fancy-textfill-jquery` and `fancy-textfill.js`, which overflow. 

[Demo Here](/misc/textfill/linebreaks/). 

<small>(Note that only `fancy-textfill-jquery` and `fancy-textfill.js` perform incorrectly - the difference between the rest is just based on their default settings.)</small>

## Single Line

The opposite of Automatic Linebreaks - sometimes we may want to ensure that our text always remains on a single line. 

![]({{ site.url }}/assets/images/content/textfills-correct-singleline.png)

All libraries support this! For `jquery-bigtext` and `big-text.js`, this is the only choice and nothing needs to be done. For `jquery-textfill` and `textfill.js`, set `widthOnly` to `true`. For `textFit`, set `detectMultiLine` and `multiLine` to `false`. For `fancy-textfill-jquery` and `fancy-textfill`, set `multiline` to `false`.

[Demo Here](/misc/textfill/singleline/).

## Nested Content

Sometimes, we might want to add multiple different elements inside our resizing element, and give them relative font-sizes. Or even include text-like content, like <a href="https://fortawesome.github.io/Font-Awesome/">font-awesome</a> icons.

![]({{ site.url }}/assets/images/content/textfills-correct-nested.png)

This is supported by all libraries except for `fancy-textfill-jquery` and `fancy-textfill`, where it causes an overflow.

[Demo Here](/misc/textfill/nested/).

<div class="grades">
	<div class="three-column">
		<b>Exceptional</b>
		<ul class="grade exceptional">
		</ul>
	</div>
	<div class="three-column">
		<b>Pass</b>
		<ul class="grade pass">
			<li>jquery-textfill</li>
			<li>textfill.js</li>
			<li>textFit</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Fail</b>
		<ul class="grade fail">
			<li>jquery-bigtext</li>
			<li>big-text.js</li>
			<li>fancy-textfill-jquery</li>
			<li>fancy-textfill.js</li>
		</ul>
	</div>
</div>

# Performance

I have written automated scripts to run a few simple performance tests on the libraries. You can try it [to see if my results match with your system](/misc/textfill/performance-demo/).

I'll admit this straight out of the gate: Whilst it's recommended to repeat an experiment in scientific pursuits, and whilst I have tried to do that here, I think it makes these results less accurate as the Javascript Engine / Browser / Operating System seem to perform some caching or pipelining or something, as the results are much lower on the repeated experiments. I attempted to add randomisation to the experiments to prevent this (varying the width, height, and text content), with little effect.

An argument could be made that average performance of execution with these optimisations is useful information, as we may repeatedly call these libraries in some circumstances (like when resizing the browser window), however I think the **most important scenario to consider is that posed by experiments 1 and 2**, as the font-size change for the first call is likely to be greater than any feature rescale in most scenarios (especially if the element is prominent on the page, and resize happens as part of page load). I'd also like to point out that in a realistic scenario, the performance increase from those Engine / Browser / OS optimisations that are seen in the final four experiments will be lessened as other code and processes will be executed between resizes, so the probability of a cache miss increases as more of our data is evicted, etc.

The experiments are as follows:

1. Performance for single execution for a single word.
2. Performance for singe execution for a multiline string.
3. Average of performance for 100 executions of a single word, with randomisation.
4. Average of performance for 100 executions of a single word, without randomisation.
5. Average of performance for 100 executions of a multiline string, with randomisation.
6. Average of performance for 100 executions of a multiline string, without randomisation.

**Google Chrome, v69**

<div class="table-container">
<table><thead><tr><th>Test ID</th><th>jquery-bigtext</th><th>big-text.js</th><th>jquery-textfill</th><th>textfill.js</th><th>textFit</th><th>fancy-textfill-jquery</th><th>fancy-textfill.js</th></tr></thead><tbody id="results-body"><tr><td>1</td><td>49.5ms</td><td>11.3ms</td><td>124.1ms</td><td>8.3ms</td><td>75.2ms</td><td>53.4ms</td><td>7.9ms</td></tr><tr><td>2</td><td>17.5ms</td><td>2.9ms</td><td>150.4ms</td><td>8.2ms</td><td>46.1ms</td><td>8.9ms</td><td>6.2ms</td></tr><tr><td>3</td><td>9.1ms</td><td>3.0ms</td><td>43.6ms</td><td>5.3ms</td><td>9.3ms</td><td>3.2ms</td><td>1.2ms</td></tr><tr><td>4</td><td>8.8ms</td><td>3.1ms</td><td>24.6ms</td><td>4.9ms</td><td>7.1ms</td><td>0.8ms</td><td>0.7ms</td></tr><tr><td>5</td><td>9.5ms</td><td>3.4ms</td><td>29.9ms</td><td>6.5ms</td><td>11.0ms</td><td>1.8ms</td><td>1.8ms</td></tr><tr><td>6</td><td>8.9ms</td><td>3.3ms</td><td>29.6ms</td><td>7.2ms</td><td>9.6ms</td><td>1.5ms</td><td>1.4ms</td></tr></tbody></table>
</div>

**Mozilla Firefox, v66**

<div class="table-container">
<table><thead><tr><th>Test ID</th><th>jquery-bigtext</th><th>big-text.js</th><th>jquery-textfill</th><th>textfill.js</th><th>textFit</th><th>fancy-textfill-jquery</th><th>fancy-textfill.js</th></tr></thead><tbody id="results-body"><tr><td>1</td><td>31.0ms</td><td>5.0ms</td><td>92.0ms</td><td>9.0ms</td><td>61.0ms</td><td>11.0ms</td><td>6.0ms</td></tr><tr><td>2</td><td>16.0ms</td><td>3.0ms</td><td>90.0ms</td><td>8.0ms</td><td>37.0ms</td><td>7.0ms</td><td>4.0ms</td></tr><tr><td>3</td><td>10.5ms</td><td>3.7ms</td><td>32.7ms</td><td>5.3ms</td><td>11.3ms</td><td>1.2ms</td><td>0.9ms</td></tr><tr><td>4</td><td>9.8ms</td><td>3.5ms</td><td>23.1ms</td><td>5.0ms</td><td>9.6ms</td><td>1.0ms</td><td>0.8ms</td></tr><tr><td>5</td><td>9.3ms</td><td>3.7ms</td><td>27.5ms</td><td>7.4ms</td><td>15.4ms</td><td>3.4ms</td><td>3.3ms</td></tr><tr><td>6</td><td>10.1ms</td><td>3.8ms</td><td>25.7ms</td><td>6.6ms</td><td>15.1ms</td><td>3.2ms</td><td>3.1ms</td></tr></tbody></table>
</div>

I obtained these results by rebooting my laptop before starting each test, to ensure that any caches were clear. I'm running this on a fairly old laptop so your results are likely faster, too.

It should be fairly obvious that the jQuery libraries suffer a big loss here, especially on Google Chrome, though `fancy-textfill-jquery` only really had problems with the first execution on Chrome. `textFit` also surprisingly has bad performance, despite not using jQuery. `big-text.js`, and `fancy-textfill.js`, and `textfill.js` all have fairly good results. `big-text.js` and `textfill.js` are both very consistently good, whilst `fancy-textfill.js` can have slower 'first run' times but then sees huge benefits from caching/pipelining on repeat resizings. 

Again, it's worth noting that the design of this experiment was not perfect, and that because of browser / processor optimisations, the execution of one script may be affecting the performance of another. `big-text.js` shares some common code with `jquery-bigtext`, as does `textfill.js` and `jquery-textfill`, whilst `fancy-textfill.js` and `fancy-textfill-jquery` are nearly identical. The fact that the jQuery versions were run before the plain JS versions could effect the results here. As could the fact that `fancy-textfill.js` is executed last, etc.

A goal I had for this experiment was create something that readers could execute in their own browser (for reproducibility / proof of undoctored and ubiased numbers), which limited the scope for experimental purity that could be achieved if I wasn't limited to a single browser window. Perhaps in the future I will come back to this and create a bash script that spawns independent headless browser windows for each resize or something.

In the interests of creating a repeatable / refreshable "single first resize performance test", I created the following pages, which indicates that the 'real' first run speeds might be higher than those from my table of results:

* [jquery-bigtext](/misc/textfill/jquery-bigtext/)
* [big-text.js](/misc/textfill/big-text.js/)
* [jquery-textfill](/misc/textfill/jquery-textfill/)
* [textfill.js](/misc/textfill/textfill.js/)
* [textFit](/misc/textfill/textFit/)
* [fancy-textfill-jquery](/misc/textfill/fancy-textfill-jquery/)
* [fancy-textfill](/misc/textfill/fancy-textfill/)

<div class="grades">
	<div class="three-column">
		<b>Exceptional</b>
		<ul class="grade exceptional">
			<li>big-text.js</li>
			<li>fancy-textfill.js</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Pass</b>
		<ul class="grade pass">
			<li>textfill.js</li>
			<li>fancy-textfill-jquery</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Fail</b>
		<ul class="grade fail">
			<li>jquery-bigtext</li>
			<li>jquery-textfill</li>
			<li>textFit</li>
		</ul>
	</div>
</div>

# Download Size

I want to measure the size of each of the libraries. Whilst the size of these libraries pale in comparison to the size of other things a site may use (eg images), it's important to keep JavaScripts small to improve your site loading time and because [they block rendering when included above the fold](https://developers.google.com/speed/docs/insights/BlockingJS) (when not included asynchronously).

For this test, if a repository provides the minified file, that one is used, else it has been minified using [JSCompress](https://jscompress.com/).

The libraries which depend on jQuery have been considered both with and without jQuery - some projects will already include jQuery as it is very prevalent, so incur no extra cost, whilst other projects would have to include jQuery to use the library. 


<div class="table-container">
<table id="size-compare">
	<thead>
		<tr>
			<th></th>
			<th>Size (library only)</th>
			<th>Size (including jQuery 3.4.1)</th>
			<th>Total Size</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>jquery-bigtext</td>
			<td>2.2kB</td>
			<td>90.4kB</td>
			<td>90.4kB</td>
		</tr>
		<tr>
			<td>big-text.js</td>
			<td>4.3kB</td>
			<td>N/A</td>
			<td>4.3kB</td>
		</tr>
		<tr>
			<td>jquery-textfill</td>
			<td>2.4kB</td>
			<td>90.6kB</td>
			<td>90.6kB</td>
		</tr>
		<tr>
			<td>textfill.js</td>
			<td>4.2kB</td>
			<td>N/A</td>
			<td>4.2kB</td>
		</tr>
		<tr>
			<td>textFit</td>
			<td>4.2kB</td>
			<td>N/A</td>
			<td>4.2kB</td>
		</tr>
		<tr>
			<td>fancy-textfill-jquery</td>
			<td>5.3kB</td>
			<td>93.4kB</td>
			<td>93.4kB</td>
		</tr>
		<tr>
			<td>fancy-textfill.js</td>
			<td>4.9kB</td>
			<td>N/A</td>
			<td>4.9kB</td>
		</tr>
	</tbody>
</table>
</div>

<div class="grades">
	<div class="three-column">
		<b>Exceptional</b>
		<ul class="grade exceptional">
			<li>big-text.js</li>
			<li>textfill.js</li>
			<li>textFit</li>
			<li>fancy-textfill.js</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Pass</b>
		<ul class="grade pass">
		</ul>
	</div>
	<div class="three-column">
		<b>Fail</b>
		<ul class="grade fail">
			<li>jquery-bigtext</li>
			<li>jquery-textfill</li>
			<li>fancy-textfill-jquery</li>
		</ul>
	</div>
</div>

# Project Health

Project Health is an important factor to consider when selecting a library to use - libraries which are not maintained could have unresolved bugs or security vulnerabilities (though that's very unlikely for a text resizing library!), and won't respond to changes in the browser/language ecosystem (important when your library heavily depends on browser APIs like these text resizing libraries!).  

* `jquery-bigtext`:  Dead, formally replaced by `big-text.js`.
* `big-text.js`:     Alive, but with un-merged pull requests. No commits since March 2017.
* `jquery-textfill`: Alive, but with un-merged pull requests. No commits since February 2018.
* `textfill.js`:     Alive; released this month.
* `textFit`:         Unclear. The maintainer says that [the project is "done"](https://github.com/STRML/textFit/issues/34), despite other users reporting bugs and un-merged pull requests. No commits since May 2016.
* `fancy-textfill.js` and `fancy-textfill-jquery`: Alive, no issues nor pull requests. Recent commits within the last year.

<div class="grades">
	<div class="three-column">
		<b>Exceptional</b>
		<ul class="grade exceptional">
			<li>textfill.js</li>
			<li>fancy-textfill-jquery</li>
			<li>fancy-textfill.js</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Pass</b>
		<ul class="grade pass">
			<li>big-text.js</li>
			<li>jquery-textfill</li>
		</ul>
	</div>
	<div class="three-column">
		<b>Fail</b>
		<ul class="grade fail">
			<li>jquery-bigtext</li>
			<li>textFit</li>
		</ul>
	</div>
</div>

# Conclusion

To be able to more easily compare these libraries, let's consider `★` to equal `2` points, `✓` to equal `1` point, and `✗` to equal `0` points. Here's a tabulation of the grades I gave, and what the resultant score become with that scoring system.

<div class="table-container">
<table id="conclusion-table"><thead><tr><th>&nbsp;</th><th>Dependencies &amp; Installation Issues</th><th>Resize Correctness</th><th>Content &amp; Functionality</th><th>Performance</th><th>Download Size</th><th>Project Health</th><th>Total</th><th>Points</th></tr></thead><tbody><tr><td>jquery-bigtext</td><td>✓</td><td>★</td><td>✗</td><td>✗</td><td>✗</td><td>✗</td><td>1x★, 1x✓, 4x✗</td><td>3</td></tr><tr><td>big-text.js</td><td>✗</td><td>★</td><td>✗</td><td>★</td><td>★</td><td>✓</td><td>3x★, 1x✓, 2x✗</td><td>7</td></tr><tr><td>jquery-textfill</td><td>✗</td><td>✓</td><td>✓</td><td>✗</td><td>✗</td><td>✓</td><td>1x★, 3x✓, 2x✗</td><td>5</td></tr><tr><td>textfill.js</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>★</td><td>★</td><td>2x★, 4x✓, 0x✗</td><td>8</td></tr><tr><td>textFit</td><td>✓</td><td>✓</td><td>✓</td><td>✗</td><td>★</td><td>✗</td><td>1x★, 3x✓, 2x✗</td><td>5</td></tr><tr><td>fancy-textfill-jquery</td><td>★</td><td>✗</td><td>✗</td><td>✓</td><td>✗</td><td>★</td><td>2x★, 1x✓, 3x✗</td><td>5</td></tr><tr><td>fancy-textfill.js</td><td>★</td><td>✗</td><td>✗</td><td>★</td><td>★</td><td>★</td><td>3x★, 1x✓, 2x✗</td><td>8</td></tr></tbody></table>
</div>

The scores agree with my feelings, so I can safely say that I can recommend `textfill.js` or `fancy-textfill.js` as your JavaScript text resizing library. `textfill.js` is the better library to choose if you really care about the pixel-perfectedness of the resize, or if you want to do complicated things with the text content of your inner element (which can just include a manually inserted line break (`<br/>`). `fancy-textfill.js` is a better choice if performance is your utmost concern, as it becomes significantly faster when resizing repeatedly.

If you can look past the lack of automatic newline inserting, `big-text.js` also had a unique advantage in that it gives special compensation for accents and characters that underhang the line (and is really fast too!). 