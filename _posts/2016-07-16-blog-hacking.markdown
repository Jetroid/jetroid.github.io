---
layout: post
title:  "Blog Hacking"
date:   2016-07-16 16:42:25 +0100
summary: "On how a throwaway idea can lead to something beautiful."
---
Six weeks ago, in an effort to learn the skills of Web Development,
I decided to immitate Fallout 3's terminal hacking.
I'm really new to HTML/CSS/JavaScript.
Having a specific goal rather than an abstract concept helps me learn new skills.

The rationale behind choosing a Fallout Terminal was that given the fully text-based design,
I could complete it without having to play around with images. 
Most of the layout would just be clever use of colours, shadings and highlighting.
It seemed like a good project to undertake - 
I am very passionate about the Fallout series, 
and I only had to take the project as far as I wanted.

![Image of the hacking minigame in Fallout 3](/assets/images/hacking-minigame-reference.jpg)
*Image of the hacking minigame in Fallout 3*

I finished the layout of the hacking portion several weeks ago,
and was very pleased with the result. 
A random list of words and symbols would be generated,
along with pointers in the two 'side bars'.
I had wrapped each individual symbol and individual word with &lt;span&gt; tags,
meaning that you could highlight the words and symbols, but not bracket pairs.

Highlighting bracket pairs seemed like an insurmountable problem.
Without this core feature, the effect was much more shallow,
and was not faithful to the source material.
If I could not find a way around this,
I would probably not progress to making the minigame actually function.

The solution I came up with took a while and is quite hacky - 
that is probably appropriate given what the hack is for!
If the user hovers over an opening bracket (one of '<','[','{', or '\(' ),
I search the rest of the line for a closing bracket symbol.
(You can find a HTML Element's next sibling using JavaScript.)
If there is a matching bracket, I generate a new &lt;span&gt; element,
and move all of the &lt;span&gt; tags (containing the symbols) into the new element.
When the user's cursor exits the new element,
the element is deleted and the child elements are returned to their original position.

Once bracket highlighting was implemented,
it was fairly trivial to add the gameplay features.
You can play it [here!](http://jetroid.github.io/hacking)
I'm sure that my source code would make a more experienced web developer weep,
but I'm a beginner! Cut me some slack!

![Image of the hacking minigame](/assets/images/hacking-minigame-game.png)
*Image of the hacking minigame*

It was only when I had completed it that I realised I had no 'win condition'.
Making a lose condition was trivial - 
I could simply implement the 'Lockout' screen that the series has.

![Image of the hacking minigame's lockout screen](/assets/images/hacking-minigame-lockout.png)
*Image of the hacking minigame's lockout screen*

Winning was a little harder.
Hacking terminals in Fallout typically grants you the ability to read the various musings,
communications and otherwise writings of the people of that world.
I could write a couple of fake, in-universe entries,
but then I had a lightbulb moment!

I could use the logged-in portion of the terminal as an access portal to a blog! 

Having an unusual interface for a blog is not a new idea for me.
My first attempt at a website last year was a really bad
(read: barely functional) knock off of a linux terminal.

![Image of the old website](/assets/images/hacking-minigame-old-site.png)
*Image of the old website*

This older website was really clunky - it was my literally first foray into HTML - 
and whilst I was very proud of it at the time, it never really met my requirements.
It required you to load a complete new page to view the posts rather than loading
them in place.

For my Fallout terminal, loading a new page would break the immersion.
Instead, I opted to use some of the features of Jekyll to develop it.
My site is being hosted on GitHub pages, which runs on Jekyll.
Jekyll allows me to have file-based blog posts rather than a content
management system like traditional blogs.
I am able to load all of the blog posts into the page and turn them
on and off at the appropriate times.
The same blog posts are re-usable - 
I write them once into a file in my _posts/ directory, and I can use
them across the site.

![Image of this blog post](/assets/images/hacking-minigame-blog-post.png)
*Image of this blog post*
