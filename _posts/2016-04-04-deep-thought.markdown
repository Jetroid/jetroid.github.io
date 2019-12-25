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

I joked that I could program a PIC and put it in a box with some switches and LEDs to demonstrate what each
logic gate does. She's a teacher, so she could take it in to school to teach the kids in her class!

Later, my Father and I talked about how it could actually be a useful module.
It would be very simple to program, and would not require a complicated circuit. Designing the PCB should be quick, and the component cost would be low, and it would be easy to stock.
There was no real reason *not* to make it!

![Deep Thought Prototype]({{ site.url }}/assets/images/content/deep-thought-prototype.jpg)
*Deep Thought Prototype with 3x Programmable Gates*

I had two variants on the idea of what the functionality for the module could be.

1. I could two inputs, A and B, and a set of every boolean operator applied to those two inputs. (ie, a set of NOT A, NOT B, AND, NAND, OR, NOR, XOR, and XNOR outputs)
2. I could two inputs, A and B, with one output that doesn't output any specific gate. Instead, the specific gate it outputs would be determined by a third input. We could potentially have three of these on a single cheap PIC. In essence, this would be a   'programmable gate'.

We had a lot of back and forth about which option we should go with (we were thinking of going ahead with the 3x programmable gates version), before realising at the last minute that if we implemented (or chose not to include) the NOT A and NOT B gates with transistors, we could actually have the best of both worlds in our module. A module with two different sections, one of which has two inputs and a set of every output, and another section with three inputs and one output.

![Deep Thought Prototype]({{ site.url }}/assets/images/content/deep-thought-prototype2.jpg)
*Deep Thought Prototype with 1x Programmable Gate and a set of every operator. The NOT A and NOT B operators were implemented with transistors and were not tested on this board.*

I had fun implementing the project and love the idea of it, as it isn't as simple as just using some off-the-shelf chips. The 'Programmable Gate' concept would be difficult to implement with anything but a micro-controller, which meant it was quite a novel idea.

Deep Thought was later released in [June 2018](https://web.facebook.com/frequency.central/photos/a.1030751053637271/1773524529359916/), and is [available for purchase now](https://frequencycentral.co.uk/product/deep-thought/).

![Deep Thought Production Model]({{ site.url }}/assets/images/content/deep-thought-production.jpg)
*Deep Thought Production Model*