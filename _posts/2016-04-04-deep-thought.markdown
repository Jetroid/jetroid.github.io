---
layout: post
title:  "Deep Thought"
date:   2016-04-03 20:00:00 +0100
background: "deep-thought-beauty.jpg"
summary: "A look at how to get the most out of a simple concept."
background-color: "#7A7164"
categories:
 - "Frequency Central"
 - "Projects"
---
My Father runs a small business called [Frequency Central](http://frequencycentral.co.uk) which
designs, builds and sells synthesiser modules.
Deep Thought is one such module.

Deep Thought, like any good project, started as a joke.
My Father and I were talking about logic gates at a family dinner
when one of my family members mentioned that she didn't really understand.

I joked that I could program a PIC and put it in a box to demonstrate what each
logic gate does. She could take it in to teach the kids in her class
at the school she works at!

Later, my Father and I talked about how it could actually be a useful module.
It would be very simple to program, and would not require a complicated circuit,
meaning that designing the PCB should be quick, and the component cost would be low.
There was no real reason *not* to make it!

![Deep Thought Prototype]({{ site.url }}/assets/images/content/deep-thought-prototype.jpg)
*Deep Thought Development Prototype*

I had two ideas for how it would work.

Obviously there would be two inputs as the inputs to the logic gate,
but exactly what the output should be like was up for debate.

I could either have just a set of every output,
(AND, NAND, OR, NOR, XOR, XNOR, NOT A, NOT B),
or just one output along with a second input to select which of the gates to use.

In effect, the second configuration becomes a 'programmable gate' -
It is a logic gate whose specific gate is determined by an extra input.

The 'programmable gate' uses 6 less I/O pins (4 vs 10),
meaning that the PIC could potentially hold multiple 'programmable gates'.

Whilst I really liked the idea of having one output per gate,
in the end we settled for a configuration including 3 pairs of 'programmable gates',
as it was the much more versatile combination.

It really wasn't a complicated project, 
and it required no new skills to complete,
so I completed it quite quickly after the concept was developed.

Of the three unreleased modules I have developed to date 
(Polygraf, Chronograf, Deep Thought), 
I would guess that this module releases first due to its simplicity.

As with these other two, it also needs a production prototype,
but this will really only change from the development prototype
by introducing the correct interface.
(The development prototype uses switches as inputs -
the production prototype would use actual sockets).
from switches and LEDs to buffered sockets/buttons.

I'm interested to see what happens with the Deep Thought's
production prototype when the output of one gate is fed into another,
as this was not a feature that was possible to test on the development prototype.
