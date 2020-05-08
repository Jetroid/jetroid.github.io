---
title: Perfection Kills
date: 2020-05-03 18:12:52 +0100
micro: true
categories:
 - "Micro"
---
For the past few weeks, I've been porting some of Frequency Central's eurorack modules to VCV Rack.

Being in the digital realm gives us the opportunity to do things that aren't really feasible to do in real life,
like outputting at a better resolution or framerate than was economically feasible for the hardware, or by creating variations of panel layout, or whatever. A notable thing is that it's just as easy to make a potentiometer as it is to make an 8 position rotary switch; in the real world, rotary switches are big and expensive so we tend not to use them, even where they would logically be useful.

For a few days last week, I had been looking for a way to convert between 8 position switches and linear potentiometers. There are a few reasons that I wanted to use this:

1. Specific modules sometimes use it as a 8 position switch, but have specific circumstances where it should be a continuous potentiometer. For example, in Chronograf, the Function potentiometer usually just has 8 positions, so it makes sense to snap between those for usability reasons. However, when in the 'Pulse Width' waveform, we take advantage of the fact that it's a linear potentiometer, so it shouldn't snap in that specific case.
2. Almost any time that a module is using a potentiometer as an 8 position potentiometer 'switch', if the module has a CV input, we use the potentiometer as an attenuator for the CV input. So it makes sense for it to be a 'snappy switch' until a CV input is connected, at which point it becomes a 'continuous potentiometer'.

I had a stab at this, and was able to create a knob that dynamically changes between being snappy and continuous. All seemed to be going well, but then whilst implementing a module using the concept, I discovered that the breakpoints where it transitioned between one value and another would be wrong when reading a value that had been converted between a snappy and a continuous knob or vice versa.

I started theorizing that I'd need to track if the value had been set in 'snappy mode' or not, and set about trying to figure how to go about that, investigating the VCV rack component library source code (and code it inherits from), etc.

Later still, whilst trying to test a solution I'd implemented, I realised that the whole 'dynamically changing between snappy and continuous' thing that I'd initially made was causing the whole VCV Rack application to crash when the module browser was opened.

I decided that enough was enough, chalked it up to experience, and shifted this code all onto a new branch and archived it to be solved later. It'd be a nice feature that would raise the bar for our modules, but it was taking too long at a time when we don't even have any modules implemented in the first place.

For comparison, today I successfully ported both the panel design and code of Deep Thought, and drew the panel for Bartos Flür II. That's much infinitely more useful than wasting days trying to make a tiny QOL improvement that users can learn to live without!

In short, perfectionism is killer.

You can always improve things later.

Focus on the big picture first.

