---
layout: post
title: "Seismograf Bug"
date: 2019-12-24 23:09:31 +0800
background: "seismograph-bug.jpg"
background-color: "#716D6C"
summary: "In which I debug and fix a tricky bug with Seismograf"
categories:
 - "Frequency Central"
 - "Projects"
---

**A year ago, I wrote about [finishing the Seismograf](/seismograf/), a Eurorack drum module that has Bass Drum and Snare Drum sound variants. I [mentioned](/seismograf/#further-work) that I was aware of what I assumed to be a very minor bug that I knew I wouldn't be able to fix until I got home. This post looks into my attempts to debug the issue and what ended up being the root of the problem.**

So... awkward little thing. I claimed that the bug was a 'Minor' bug. It turns out that it wasn't so minor; I just hadn't tested the module extensively enough with an actual modular system. It turned out the the problem happened alarmingly often in a non-lab environment, so much so that the module could be considered unusable.

Fortunately, due to the slow process of launching a module, we had to opportunity to notice the extent of the problem before the code saw mass distribution. This is important because it isn't feasible to update embedded PIC devices once distributed.

I turned my attention to fixing this Seismograf issue in mid-October 2019, as we were hoping to launch the whole -graf series module line in the month following. I didn't have many ideas about what might be causing the problem, but I knew the rough symptoms quite well. The module would play sounds normally - but then at certain settings - it seemed - it would play a sound veryyy... veryyyyy... slowwlllyyyyyy.

I theorised that perhaps it was accidentally playing the sounds at specific multiples of the intended playback rate. So for instance, instead of playing at an appropriate 10ms for the sound, it might take 1024 times longer and play for a whole 10.2s or so. I had this assumption because at some points during the development, some subroutines were taking 'too long' to execute and produced audible glitches.

I don't have any fancy hardware for recording and measuring samples, so I used a simple oscilloscope (the [Mordax DATA](https://www.mordax.net/products/data) in this case) and painstaking measured the duration of the samples by 'counting the squares'. Unfortunately, I couldn't determine any pattern in the duration of playback, and my assumption that the bug only happened at certain settings didn't seem to hold water either.

![I took dozens of photos of my oscilloscope to try to detect a pattern in the waveform timings.]({{ site.url }}/assets/images/content/seismobug-oscilloscopes.jpg)
*I took dozens of photos of my oscilloscope to try to detect a pattern in the waveform timings.*

I did notice that the problem seems to be exacerbated when changing the settings mid playback. I further narrowed this down and saw that it was only when changing the 'tune' setting (aka the pitch) that exacerbated the problem. Changing distortion or sound type didn't cause the problem to occur any more than normal. Well, what's special about Tune?

It was whilst I was reading through my code for the Tune subroutine that I realised what was causing the problem. When programming a PIC, it is common to set a timer with different preload values. The preload values determine the duration until the timer overflows, which allows you to do things at specific intervals. These preload values would be inconvenient to compute for the PIC itself as they are often logarithmic, so it's common practice to use a lookup table to find the values. In Seismograf, I was using the PIC16F1765, which comes with a Flash Program Memory Control module. The Flash Program Memory Control module is essentially something that allows you to easily read from (and even write to) large blocks of the flash program memory. Cool, huh?

What I hadn't realised is that I was using the Flash Program Memory Control module in both the main routine (when reading the timer preload lookup), and in the interrupt service routine (when reading the data sample). If that doesn't ring any alarm bells to you, then don't worry, I wouldn't expect it to unless you do a lot low level programming.

Let's look at an example process path where the problem occurs to understand what was happening:

1. The 'Tune' setting changes and the Main Loop reads this new value.
2. The Main Loop attempts to lookup the new timer preload value by using the Flash Program Memory control. It writes to the PMADRL:PMADRH register pair, telling the program memory controller where to read. It then initiates a read by writing to PMCON1.
3. The Interrupt Service Routine jumps in, activated because the timer overflowed.
4. The Interrupt Service Routine attempts to read the next data sample. It writes to the PMADRL:PMADRH register pair, telling the program memory controller where to read. It then initiates a read by writing to PMCON1. In the process, the program memory read initiated earlier in step 2) is cancelled or the returned data is destroyed.
5. The Interrupt Service Routine correctly gets the next sample, processes it, and exits. This means that the waveform shape is correct.
6. The Main Loop tries to finish it's timer preload program memory read, but gets the wrong data because it was interrupted by the interrupt service routine. It sets up the sample to play at the wrong rate, leading to the glitch occurring. Future overflows use this value too, meaning the rest of the sample (and future triggers) are broken until the Tune setting changes again.

As a rule, you need to be very careful when using an interrupt service routine, because it is possible to disrupt whatever the main routine is doing. It seems that I wasn't as careful as I needed to be when I wrote Seismograf, and thus I experienced problems.

The problem was resolved when I changed the program to only use the Flash Program Memory Control module whilst in the interrupt service routine. Now the module sounds great, and no harm done. I've uploaded a quick demo of the Snare drum variant below. Enjoy!

<div class="youtube">
    <iframe src="https://www.youtube.com/embed/R08RDuul6xY" allowfullscreen></iframe>
</div>

[Both](https://frequencycentral.co.uk/product/seismograf-bd/) [versions](https://frequencycentral.co.uk/product/seismograf-sd/) of Seismograf were released (alongside with [Chronograf](https://frequencycentral.co.uk/product/chronograf/), [Polygraf](https://frequencycentral.co.uk/product/polygraf/), and [Cryptograf](https://frequencycentral.co.uk/product/cryptograf/)) when we launched the new Frequency Central website in mid-November, 2019. It's too early to see what the user reaction will be, but I'm hoping that people will really enjoy the module.