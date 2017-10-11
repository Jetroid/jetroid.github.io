---
layout: post
title: "Caption Contest"
date: 2016-08-12 11:37:33 +0100
background: "caption-beauty.jpg"
summary: "A brief guide to adding image captions to Jekyll blog posts."
background-color: "#7B7B6E"
categories:
 - "Tutorials"
 - "Jekyll"
---
To add an image to a Markdown post, you write something like this: 

```markdown
![Text Here](image.url)
```

The text is added as the alt-text for the image.
This is okay, but I want to add text that is readily visible to my images.

I previously was doing this very hackily using JavaScript,
to strip the alt-text out and add it below the image.
This unnecessarily wastes cpu cycles and adds complexity to the page.
Plus it won't work if the user has JavaScript disabled!

I've now moved on to a solution like this: 

```markdown
![Text Here](image.url)
*Text Here*
```

This inserts a &lt;em&gt; tag directly after the &lt;img&gt; tag,
but within the same &lt;p&gt; tag. 
(Be careful not to insert a newline between the image and the em,
as that will put them in different &lt;p&gt; tags).
I then style this with css, like this: 

```css
img + em {
	display: block;
	text-align: center;
}
```

This is a really nice script-free solution to a problem I had.

The following code produces the image at the bottom

```markdown
![This image has a caption!](/assets/images/caption-beauty.jpg)
*This image has a caption!*
```

![This image has a caption!](/assets/images/caption-beauty.jpg)
*This image has a caption!*
