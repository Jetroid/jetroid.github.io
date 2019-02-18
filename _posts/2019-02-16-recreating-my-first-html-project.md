---
layout: post
title: "Recreating My First HTML Project"
date: 2019-02-16 19:41:21 +0800
background: "terminal-background.gif"
background-position: "top left"
summary: "My first attempt at HTML was a fairly-cool but terribly coded 'terminal simulator' web page. What can I do now, five years later?"
categories:
 - "Projects"
embed_twitter: true
---

**Back in 2014, before I had even started University proper, I had discovered Linux in the form of Ubuntu in the computer science laboratory. I instantly liked it, and became a little obsessed. I was eager to start a blog of some kind, but hadn't used HTML, CSS, or JavaScript before. I wanted to combine my newfound passion for Linux with the blog, and I ended up creating [this monstrosity](/old-terminal/). Whilst I appreciate the creativity, it wasn't well implemented and would be difficult to maintain, so I quickly stopped using it.**

**I have always wanted to revisit the idea as I felt like it could be super cool to have an emulated terminal in the browser, with my blogposts simply part of the filesystem. This week, [Coder Story](https://coderstory.io) asked to interview me, and one of the questions asks me to talk about how I learn programming and how I develop my projects. I pride myself on the fact that I revisit old projects to improve them, and realised I never did for this old one. I felt that it was the perfect time to go back and that it could be very valuable for CoderStory readers to see. I decided to spend a few days taking the time to [recreating the project](/terminal/) with my current skills and [tweet about it the whole time](https://twitter.com/JetroidMakes/status/1094534029964062720).**

I started with tweets announcing what I was going to be doing, and describing the old concept and the plan:

<blockquote class="twitter-tweet tw-align-center" data-theme="dark" data-dnt="true" data-link-color="#d05d5d"><p lang="en" dir="ltr">The project I&#39;m going to be revisiting was actually my first attempt at HTML, written just before I started University 🎓 in 2014. <br><br>I had just gotten into Linux 🐧, and wanted to play with HTML, so created an amateurish terminal-themed &#39;blog&#39;: <a href="https://t.co/91e6ATTNwT">https://t.co/91e6ATTNwT</a> <a href="https://t.co/Qts3jSsd2L">pic.twitter.com/Qts3jSsd2L</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094534039669600256?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

I think it's generally a good idea to draw some sketches of your idea. It gives you something to compare against. Some people go through painstaking detail to draw their interface in design software and ensure their site matches it pixel-perfect, but that isn't my style. When I'm building something complicated, I sketch out the architecture of what I'm building in a block diagram format. I also like to sketch out the database tables to reduce problems later. 

In this case, I have a good idea of what I will be building, and I have the perfect reference image in the form of my terminal which I can open at any time. This project was so small that it was hard to go wrong with the plan, but I still wanted to sketch out some ideas so that my mind would think about how I was going to implement things. The problem here was that the project could go on forever (there is almost unlimited possibilities for command line programs to implement!) and I could keep adding 'one last feature'. The plan for me served more to limit the scope than to clarify idea.

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">I&#39;d like the new version to be more interactive - there should be a handful of &#39;programs&#39; ⚙️ (functions) the user can &#39;execute&#39; and a &#39;filesystem&#39; 💾 (just json) that they can navigate.<br><br>This is a small project so doesn&#39;t need much preparation, but I sketched my ideas on paper: <a href="https://t.co/Wn4xnEblvT">pic.twitter.com/Wn4xnEblvT</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094534061891059712?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

It's quite neat that the sketch of how my filesystem would work turned out to be very similar to the actual implementation (though I did end up later switching to an object-oriented style of declaration to reduce repetition and avoid typos).

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">I have some of my &#39;filesystem&#39; 💽 in my HTML file and some in my JS file. The stuff in the HTML file lets me use Jekyll to &#39;pull in&#39; the metadata about my blog posts when the page generates. I&#39;ll be adding more here later, this is just a proof of concept. <a href="https://t.co/oWxYWhMpbb">pic.twitter.com/oWxYWhMpbb</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094568612541521920?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

My first step is usually to create something that I can build from. In the case of this project, it was a basic, ugly command prompt that I didn't put any effort into CSS styling. I chose the layout of my command prompt in zsh to be the prompt for this website. I built methods like `print()` that a command could run to write to the output, and an `enablePrompt()` function that indicates that the command is done and that the user can start typing again.

(At some point I went back and modified `print()` to escape HTML entities (eg convert `<` into `&lt;`) in the user input so that typing something like `<script>alert(0);</script>` doesn't get parsed as HTML and then executed, instead printing `&lt;script&gt;alert(1)&lt;/script&gt;`. I sometimes needed to add HTML of my own in the print, so created a `printUnsafe()` which doesn't do it for you, and expects you to escape an user input. In a real site, this would be referred to as "protecting against Cross Site Scripting (XSS)", and is very important to protecting your users. Often you want to escape HTML entities ***AS SOON AS THE DATA ENTERS YOUR SYSTEM***. Here, XSS isn't important at all as a user cannot change the state of the page for future users, but I did it anyway so that my more nerdy friends wouldn't make fun of me.)

<blockquote class="twitter-tweet tw-align-center" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">First step is to set things up so that we can print to the console when the user hits enter. It&#39;s a simple first step but a necessary one. I wanted to use the DOM&#39;s cloneNode(true) but it would have created duplicate id&#39;s. 🙅‍♀️<br><br>Next step: Parsing input and executing it. ✌ <a href="https://t.co/xH4Zrnfdx9">pic.twitter.com/xH4Zrnfdx9</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094542702476111872?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

To expand on the `cloneNode` comment from the previous tweet: `cloneNode(true)` makes a deep copy of the DOM elements, which would be useful as I wouldn't have to 'recreate' the prompt when I add it to the history after the user presses the enter key (return key). However, cloneNode makes a truly accurate copy, meaning the 'id' property will be duplicated, the event handlers will be duplicated, etc. We don't want any of that, which means we can't really use cloneNode, and we have to do it from scratch ourself.

After I had programmed the file system (discussed above), I made a few helper functions to convert objects to paths, and paths to objects. If a user specified any path with any valid format like:


`myfile.txt`

`path/to/myfile.txt`

`~/myfile.txt`

`~/path/to/myfile.txt`

`/path/to/myfile.txt`

`../path/to/myfile.txt`

`./path/to/myfile.txt`


...then I can return the filesystem JSON object that represents it. Useful!

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Wrote a function to do the opposite of the above. <br><br>Looks simple, but I had a bug in my while loop for a while and I kept infinitely looping and crashing my browser. 🧐 🤔 <a href="https://t.co/6TZ5DOZ4G8">pic.twitter.com/6TZ5DOZ4G8</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094614725902557184?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

This meant that when a command referred to a file or a directory, I could easily access the file. Likewise, it meant that I could easily add the working directory to the command prompt. `cd` and `ls`, two commands that involve interacting with files in a big way were also easy to implement with minimal code.

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Those functions worked to implement `cd` and (the most basic version of) `ls`! 🎉<br><br>Just for fun, let&#39;s do wget next! 😄 <a href="https://t.co/eXPjSnRq5W">pic.twitter.com/eXPjSnRq5W</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094622218716205056?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

I wanted some way for users to create files (but wasn't prepared to implement a more complicated program like `nano` or `vim` for this sprint), so I decided to create `wget`, which would actually just be a AJAX call to the website.

I ended up having problems with CORS. CORS is a security policy which prevents sites making requests to servers on a different origin. The browser refuses to connect to a service which has CORS headers in the response. I don't think CORS is a very sensible mechanism, as it does not prevent the request from being made, it merely relies on the browser not making the request. `wget` or `curl` do not resepct CORS (CORS is not a valid mechanism to protect from server-to-server requests), so my implementation of `wget` should not obey CORS. Setting up a server between the resource we want to request and the browser would allow us to proxy the request back to the browser without the CORS response headers, hence circumventing the CORS protections. A convenient project is set up [that does this already called CORS Anywhere](https://github.com/Rob--W/cors-anywhere), so I deployed it on Heroku and just like that, my `wget` command worked.

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Hurray! `wget` is now working too! 🙌 (Or at least, the most basic functionality is working - I still need to update the text and check for bugs.) <br><br>I&#39;m able to download files from both <a href="https://t.co/SU3VrtBYfn">https://t.co/SU3VrtBYfn</a> and <a href="https://t.co/KHW5t0jzzF">https://t.co/KHW5t0jzzF</a> (the two links I tested). 😊 <a href="https://t.co/uISasPCsSh">pic.twitter.com/uISasPCsSh</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094649363677077504?ref_src=twsrc%5Etfw">February 10, 2019</a></blockquote>

In the morning, I updated the CSS to move away from the horrible white background and black text towards a colour scheme that matched my real terminal. I remembered how some servers have [ascii art in the header after you log in, along with warnings about monitoring users](https://github.com/AbhishekGhosh/HP-Cloud-ASCII-Logo). I also remembered how in the media, a 1337 h4ckz0r might have their online alias in ascii on their personal terminal or server. I decided to write 'Jetroid' in the style of [my logo](/assets/images/jetroid-logo-miami.png) in ascii, and I think it turned out pretty well!    

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Added some fluff to make it look more like you just logged into a neckbeard-admin&#39;s server. 😅<br><br>Obviously today I&#39;ve broken protocol by focusing on front end visual rather than functionality, but the white background was giving me eye strain. 😳 <a href="https://t.co/lFQN3kshB9">pic.twitter.com/lFQN3kshB9</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094890396298047489?ref_src=twsrc%5Etfw">February 11, 2019</a></blockquote>

I then implemented 'animated' commands - commands that initially give out a little output, but then add more quickly as data is loaded or processes complete. I did `wget` and `shutdown`. I'm a big fan of `shutdown` because I added jokes playing on the `Stopping <daemon x>` and `Shutting down <process y>` - it may initially look normal because the first few are ones you'd expect to see, but then it devolves into being entirely jokes. My favourite is `Shutting down the-us-government`, and both my friend and I simultaneously came up with it at the same time. I think the end result of both is very authentic. 

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Back again after eating 🍜 and I&#39;ve implemented a `shutdown` command. <br><br>I wasn&#39;t able to find anywhere to copy some of the shutdown text so I had to write my own from memory. To bulk it up I added plenty of jokes. 😅 <a href="https://t.co/foIsD3UgHB">pic.twitter.com/foIsD3UgHB</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1094960034935500801?ref_src=twsrc%5Etfw">February 11, 2019</a></blockquote>

In the morning, I implemented `cat` for my blogposts. To save memory, and decrease page load times, the content of a blog post isn't stored in full in the content of the /terminal/ page. Instead, I request the file from the server when needed using an AJAX call.

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">But first, some quick code to make sure I can `cat` the HTML of one of my blog posts. <a href="https://t.co/oH6Xj7tLb5">pic.twitter.com/oH6Xj7tLb5</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095190269283074048?ref_src=twsrc%5Etfw">February 12, 2019</a></blockquote>

For the benefit of [CoderStory](https://coderstory.io/)'s readers, I discussed the UNIX permission system. I was trying to show that you can combine knowledge you have with content to try to gain new information. I also wanted to show how I had questions about the UNIX permission system, and that by writing them out, I could find answers. This is a big part of learning to code, so I thought it important to mention, even if the example is not the best.

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">The nice thing about writing out what you need to know like this is that these are basically questions I can throw into google... <br><br>Sure enough:<br><br>16:57:44 jetroid@netricsa:0~/projects/jetroid.github.io$ groups<br>power wheel input storage users <a href="https://t.co/guDHqCPrDT">pic.twitter.com/guDHqCPrDT</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095245765469859840?ref_src=twsrc%5Etfw">February 12, 2019</a></blockquote>

I used this information to implement read/write permissions for commands like `cat`, `wget`, `rm`, and others.

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">I also implemented read/write permissions for use with cat, wget, and others (when I implement them!).<br><br>`jetroid` can&#39;t read /etc/shadow nor write to / 🙅‍♂️, but root can do both ✅.<br><br>You&#39;ll see the precedence described at <a href="https://t.co/DhFKgxYdHn">https://t.co/DhFKgxYdHn</a> quite clearly in lines 212-217. 😁 <a href="https://t.co/19HJ3jyNie">pic.twitter.com/19HJ3jyNie</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095722971442757632?ref_src=twsrc%5Etfw">February 13, 2019</a></blockquote>

I implemented functionality for superusers and `sudo`. `sudo` simply sets a variable to indicate that we are in `sudo`, whilst superusers have an `isSuperUser` property. I modified the commands to first check for `sudo` or `user.isSuperUser` to bypass checking permissions. I then implemented `su`, which pushes the current user to a stack (so that we can return to it when we run `exit`), and then changes to the desired user. `sudo` is kind of neat because it just recursively calls `determineCommand` and has no problems.

I then went ahead and implemented a whole bunch of other fairly simple (< 5 lines each) commands that either interact with the filesystem permissions and user system (like `chown`, `chgrp`, `who`, and `whoami`) and ones that were simple to implement (`logout` and `exit`).

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Here&#39;s a little demo of sudo and su, as well as a few of the other commands.<br><br>Note that as `jetroid` chown was denied, but it was allowed as both a `sudo` command (using !!), and with `root`.<br><br>It looks so much like my terminal right now that I keep trying to use my shortcuts. 🤐 <a href="https://t.co/dYeAQUCReB">pic.twitter.com/dYeAQUCReB</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095374408330309632?ref_src=twsrc%5Etfw">February 12, 2019</a></blockquote>

When I encountered a bug in my code, I wrote about it and my debugging process:

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">I was confused, so added logs to the `rm` function (blue circle), then reran my command. I saw that `rm` was being called as if I had first specified the root `/` (green) by writing blank (orange). <br><br>I suspected multiple-spaces in the middle of a command, so I tested it (red). <a href="https://t.co/q6comUAB6F">pic.twitter.com/q6comUAB6F</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095927287675940864?ref_src=twsrc%5Etfw">February 14, 2019</a></blockquote>

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">We can solve that first point pretty easily by sanitising our input a little better, and replacing repeated spaces with a single space, then trimming off all whitespace to the left or right of what the user wrote.<br><br>It&#39;s a pretty simple fix, all things considered. 👍 <a href="https://t.co/8OOpzkuD1y">pic.twitter.com/8OOpzkuD1y</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095927298547605504?ref_src=twsrc%5Etfw">February 14, 2019</a></blockquote>

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-conversation="none" data-link-color="#d05d5d"><p lang="en" dir="ltr">But there was also a second &#39;bug&#39; - did you notice it? <br><br>The natural whitespace collapsing is affecting the &#39;past terminal entry&#39; in an undesired way! Multiple spaces got represented as a single space! 🤦‍♂️<br><br>To fix this, we can wrap it in a &lt;pre&gt; tag or use CSS white-space:pre; <a href="https://t.co/758f2xMOdj">pic.twitter.com/758f2xMOdj</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1095927310753005568?ref_src=twsrc%5Etfw">February 14, 2019</a></blockquote>

I was approaching the end of the project, so I decided (for fun) to implement a very simple command that converts the styling to be more like [the original iteration](/old-terminal/).

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="und" dir="ltr">😍 <a href="https://t.co/GF6BArua9L">pic.twitter.com/GF6BArua9L</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1096114734770774016?ref_src=twsrc%5Etfw">February 14, 2019</a></blockquote>

The biggest feature that I had been dreading was making the typing look correct, aesthetically. Up until this point, the page used a boring text box and a button for input. I wanted to change that so that it was indistinguishable for typing on a normal terminal. When I had worked on the [old version](/old-terminal/), I tried everything I could to make the `<input />` or `<textarea />` tags flow to cover the rest of the page, but I wasn't able to and it was still quite noticeable what I was doing. 

I wanted to avoid that, so figured that I would try to do some fancy `onkeyup` / `onkeypress` / `onkeydown` stuff. 

This was a BAD IDEA.

As it turns out, without a library to help you, the `e.which` library is fairly messy to determine which key you are using. Different keys on the keyboard are bound to each of the `onkeypress` and `onkeydown` etc functions without any rhyme or reason that I could see. And you manually have to keep track of which modifying keys (like Ctrl, Alt, etc) are being pressed.

I actually got something that ALMOST worked, but if I typed too quickly, the characters would appear in the **WRONG ORDER**. ***UNACCEPTABLE***.

In the end, I decided to resort to a much more simple method:

<blockquote class="twitter-tweet tw-align-center" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Then all it takes is a little function to take the data from that input tag and display it where I want, which I call onkeyup and oninput. A final onclick to the whole body to autofocus on the 1px by 1px text input completes the illusion. 🧙‍♂️<br><br>And it works really well! 😄 <a href="https://t.co/0W2AjaOaJF">pic.twitter.com/0W2AjaOaJF</a></p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1096119914119671808?ref_src=twsrc%5Etfw">February 14, 2019</a></blockquote>

After this, I considered the project "done". Obviously, I could extend it almost infinitely and implement things like bash file parsing or whatever, but there has to be limits or you'll just waste your whole life.

I added a few finishing touches and signed off...

<blockquote class="twitter-tweet tw-align-center" data-lang="en" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Some final statistics:<br><br>🕖 25 hours (how many composing tweets? 😝)<br>⌨ 1223 lines of code<br>🐦 60 tweets (including this one)<br>💾 15 git commits<br>🤖 18 commands<br>🤪 Too many emojis...<br><br>Crazy ride! Thanks for following along!</p>&mdash; Jetroid (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1096129230931353600?ref_src=twsrc%5Etfw">February 14, 2019</a></blockquote>

***You can view the completed project [here](/terminal/), the project that inspired this one [here](/old-terminal/), or view the entire tweet thread [here](https://twitter.com/JetroidMakes/status/1094534029964062720).***