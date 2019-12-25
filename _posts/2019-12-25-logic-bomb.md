---
layout: post
title: "Logic Bomb"
date: 2019-12-25 15:31:28 +0800
background: "deep-thought-logic-bomb.jpg"
background-color: "#B1A8A3"
summary: "A revival of an older version of a project."
categories:
 - "Frequency Central"
 - "Projects"
---

**One of the first modules I developed for Frequency Central was [Deep Thought](/deep-thought/), a boolean logic module. It was received very positively! It had a set of Boolean logic gates on one PIC, along with a output where you could choose which logic gate to use (the 'addressable boolean' or 'selectable gate'). Before we settled on that particular feature set, we had an alternate set of functionality. Things have a funny way of resurfacing, and now we're looking at that alternate set again...**

I think that Deep Thought was popular because it was a nifty package that allowed a musician to control their modules in a variety of ways, and could create ever changing gate patterns. It's a relatively cheap and easy build too. Nice! Plus, it's a heck of a light show when the 'Boolean Operators' section is being used.

As I discussed in [my original article](/deep-thought/) about that module, we almost went with a different (but similar) set of functionality, but changed our minds at the last minute. The original idea left out the full set of all logic gates in favour of three of the 'addressable boolean' sections. I think that was the right choice, as the 'boolean operators' section is much more intuitive than the 'addressable boolean' section.

<hr />

Anyway, a distributor (one that often stocks Frequency Central products) recently got in touch with us, looking to stock a logic module or series of logic modules. Deep Thought, as presented, wasn't quite what they were looking for, and wanted to see if we had anything else in the works or if we could design something custom for them to stock. We knocked a couple of ideas back and forth, before coming back to the 'multiple addressable booleans' scheme that had been the original idea for Deep Thought.

This idea seemed to be a-go, and thus, *Logic Bomb* was born. It would be a module with 2 'addressable boolean' sections, in a slimmer form factor than 'Deep Thought'. Although the 'Logic Bomb' module that we are designing for the distributors will only utilize 2 of the addressable boolean sections, we can and will fit 3 of them on to the PIC. Perhaps we might find a use for them later.

I rooted around in our 'Old Prototypes' box to find our old 3x Addressable Boolean concept board, but I found that the [switches on the old board]({{ site.url }}/assets/images/content/deep-thought-prototype.jpg) had been salvaged at some point, so I replaced them with simple jumpers to do the same job. I tested my old code to check that I had the correct version; everything worked. I then updated my code in a few places with some of the new things I had learned - I wanted to give it better hysteresis on the 'gate selection' inputs. I like that this old code got to see a life in the end.

![The Deep Thought prototype board used to test Logic Bomb.]({{ site.url }}/assets/images/content/deep-thought-logic-bomb.jpg)
*The Deep Thought prototype board used to test Logic Bomb.*

We're considering offering the PIC for this project as a standalone purchase that DIY'ers can use to create something new, as it is a versatile component with 3 selectable logic gates of your choice. Watch this space for information about that, or about the module itself when we release it!