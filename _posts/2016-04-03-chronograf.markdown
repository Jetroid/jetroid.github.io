---
layout: post
title:  "FC Chronograf"
date:   2016-04-02 20:00:00 +0100
summary: "The story of the timer-based Chronograf module."
---
My Father runs a small business called Frequency Central which
designs, builds and sells synthesiser modules.
The Chronograf is one such module.

Whilst I was finishing the Polygraf during the winter break,
my Father proposed to me a second module to act like the 'brother' of the Polygraf.
It would be designed to provide a stoppable clock source for the Polygraf,
running between 300 and 1200 BPM. 
When stopped, the module should send a Reset signal to tell the Polygraf 
(and any other modules)
to go back to the start of the sequence.
An additional feature that would be really nice to have would be a
Low Frequency Oscillator (LFO) synced to the clock rate.
Eg: You would be able to output a wave (for example, Sine), 
that would go through 360° for each clock.
A 'Multiplier Control' would be built in, which would 'multiply'
the number of clocks needed to go through 360°.

When proposed to me, I almost dismissed the idea.
My brief experience with timers hadn't been a good one,
and this module would be completely based around timers.
I resolved to complete the Polygraf and think about it.

![Chronograf Calculations](/assets/images/chronograf-spreadsheet.png)

I finished the Polygraf on 2015/12/29,
and I felt like I could achieve anything!
I was to go back to Southampton in very early January,
meaning that any attempt to work on the Chronograf would have to complete
it within a very short time frame.
Those few days were naturally filled with Family events as well. 
I resolved to treat those few days like a Hackathon - 
I spent the first day checking I completely understood the requirements.

Because the module was very timer-based,
I decided to spend some time calculating the correct timer values.
This was a little bit complicated, and I decided to use the power of Spreadsheets!!
Once calculated, I needed some way to pull these out of LibreOffice Calc and into PIC dt format.
I saved the values I needed as a CSV file and then wrote a quick python script
to convert it to the desired format. This proved useful and effective.

![Chronograf Data Script](/assets/images/chronograf-python-script.png)

On New Years Eve 2015, I worked solidly into the new year.
I didn't have a hardware prototype to test my software on, 
so I was coding blind.
I completed the initial software in the first few hours of 2016.
This felt like a big achievemenet for me for me - 
even if the code didn't work first time, I had still thought of the plan for the module,
as well as calculating and then coding it - all within two days.

The next day we built a hardware prototype to test the software.
My first attempt didn't work correctly - 
it didn't seem to read the inputs correctly.
I quickly realised that this was because I had accidentally used
code for the 16F88 (that I had been using for the Polygraf)
rather than the 16F684 (that the Chronograf is using).
I couldn't tell if the LFO Waveform output was working correctly.

It wasn't until three weeks later
(After I had sat my university exams)
that I was able to confirm that it actually did not work correctly.
This problem resulted simply from having bits in the wrong memory locations.
I completed the Chronograf on 2016/01/19.

![Chronograf Prototype](/assets/images/chronograf-prototype.jpg)

Later, in a lecture about embedded hardware, our lecturer set us the challenge
of using an AVR to read the interval between two button presses and flash
an LED at that same interval using C code.
This seemed like an interesting feature that I could add to my Polygraf PIC,
and Frequency Central liked the idea, 
so I implemented this extra feature during the 'Easter Break', finished 2016/04/02.

Going forward, we need to build a production prototype. 
The development prototypes for the Chronograf and Polygraf
work really well together, and hence it is likely that before either
module is released, the other will also have to be ready for release.
At the time of writing, the Polygraf is further ahead in the release pipeline,
as it has a prototype front panel.
However, the Polygraf still has some small hardware problems to solve - 
it is unclear which module will delay the other.
