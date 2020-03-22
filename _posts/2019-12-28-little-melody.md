---
layout: post
title: "Little Melody"
date: 2019-12-28 15:35:00 +0800
background: "little-melody-prototype.jpg"
background-color: "#AEA69A"
summary: "The development process of an addictive melodic pattern generator."
categories:
 - "Frequency Central"
 - "Projects"
embed_twitter: true
---

**Little Melody is a pseudo-sequencer pseudo-melodic-pattern-generator that I coded during Summer 2019. It's frankly addictive-to-use for a musician, and you can get jamming in no time. It uses a clock divider, voltage mixer, and quantiser to make incredibly satisfying melodies. This article tells the story of how we came up with it.**

Way back in 2013 when Frequency Central designed [Pocket Calculator](http://web.archive.org/web/20190515165654/http://www.frequencycentral.co.uk/?page_id=1694) - a now-discontinued clock-divider module - we conceived of Little Melody. It would be an addon module that connected to Pocket Calculator's 'Expansion' header, and would use the clock divisions to create a melody. We didn't end up going with that design, but [the name](https://youtu.be/eSBybJGZoCU?t=112) and idea stuck around.

<small>Actually, the idea is much, much older than this, as it's something my dad once wanted to build back when he was making his first modular synthesizers as a younger man. For me, there's something very cool about working on a project that your father conceived of before you were even conceived.</small>

The theorised 'Little Melody for Pocket Calculator' would essentially allow you to assign voltages (which represent notes) to the different clock divisions, which were then mixed together. When that clock division is high, the note plays. When multiple divisions are high, the sum of the two would play (resulting in a higher pitched note), etc. The flaw/drawback with that idea was that the divisions for Pocket Calculator are static. Without changing the notes, it would have just played the same sequence over and over again. The only change that you would be able to make to the pattern is changing the set of notes that play. There just wouldn't be much flexibility.

The version that we designed in 2019 aims to address these issues. Instead of having specific clock divisions on specific outputs like with Pocket Calculator, our new version has a 'division selector' potentiometer input for each output that allows you to change clock divisions on the fly. To simplify things, we reduced the total number of 'outputs' from the clock divider from 7 to 4. This version would essentially have a full Pocket Calculator hidden inside, and the user changes the routing of which division goes to which output. This new design means that you can keep the set of notes the same, but vary the order that they are played in the sequence, which adds a lot of variability and flexibility.

With the idea in hand, it was time to start work...

<hr />

# First Steps

![PIC breakout board, with bundled wires.]({{ site.url }}/assets/images/content/pic-breakout.jpg)
*PIC breakout board, with bundled wires.*

I have this PIC breakout board that I designed a few years ago. It has a series of commonly used components, inputs, and outputs that can be connected to a PIC in any configuration. I use it like a more-permanent breadboard; I make an approximation of the circuit I need, and then I use it to test inputs and outputs. Once I commit myself to a pinout for my PIC, I create a true prototype testing board that I develop the rest of the project with. I used this my breakout board for Little Melody to test the PIC's interrupt-on-change module, which I intended to use for the Clock and Reset inputs.

I had never used the interrupt-on-change module before, so it made sense to get that working correctly first. I hooked it up as a clock input that causes a bank of LEDs to count up in binary, and a reset input that turns all of the LEDs off. This was good as it meant that I had already implemented the clock counter that would serve as the core of the module. I like to make the most essential nugget of a PIC project first, so that I have a known-working baseline functionality to build upon. I've found that if I try to build too much at once, things go wrong for me. Since learning this, I try to build something small that I can test first, even if it's something I know that I'll have to mostly change it later.

A recording of this initial piece of code in action is demonstrated below:

<div class="youtube">
    <iframe src="https://www.youtube.com/embed/LMtqQVfcmxs" allowfullscreen></iframe>
</div>

# Feature Innovations

Whilst the bulk of the project had already been conceived years in advance of us actually developing the module, there was still room to create new features to enhance the possibilities. Whilst implementing the base feature set, we came up with a number of features that would enhance the flexibility of the project.

For instance, we realised that we could have more than just a single 'division selector' that determined the routing for an output, but that we could include an additional 'division presets selector' that overrides the four individual selectors and changes them all. The user can then use the individual selectors to adapt the preset to their liking.

![Little Melody prototype.]({{ site.url }}/assets/images/content/little-melody-prototype.jpg)
*Little Melody prototype. The smaller board is a common 1v/Octave PWM conditioner that we used for Little Melody, [QuaSH](/quash/), and [Neograf](/neograf/).*

Another feature we came up with is the idea of a 'Modes' input. The first two are very easy to explain. In the first mode, the internal clock divider simply counts up as normal - the same functionality as Pocket Calculator. In the second mode, the internal clock divider counts down (The outputs all start 'on'). The remaining six modes are where things get complicated. These are 'up/down modes', and have specific clock division cutoff points. We'll consider "Up/Down 16", which is the up/down mode where the cutoff is at the /16 division. In this mode, for the first 16 clocks, we appear to be counting up normally. However, when the /16 output comes on, any clock outputs with clock divisions /1, /2, /4, and /8 start counting down. The remaining outputs continue to count up. After the 32nd clock, those /1, /2, /4, and /8 revert to counting up again. This is hard to imagine, but it has the effect that (depending on which divisions you have set) your pattern begins to sound a bit 'triangular', 'sawtooth-like', or 'flip-floppy'.

This is represented in the graphic below:

![Different modes with different division settings.]({{ site.url }}/assets/images/content/little-melody-graphs.png)
*Different modes with different division settings. X axis represents the number of clocks, Y axis represents the pitch.*

We played with the module a lot after we had all of those features implemented correctly. (Implementation was surprisingly tricky, actually, and I had to write pseudocode in Python first to test the logic as the interplay between features makes things more complicated than it seems). The module felt good, really good. However, every time we wanted to change the notes in our sequence, we'd spend a bunch of time trying to tune individual voltages to be specific notes, as otherwise it'd be out of tune. This flicked a switch in my brain, and made me think of [the quantiser that I designed for my A-Level electronics project](/bartos-flur/#a-level-electronics).

If we included a quantiser right before the output, we'd remove the necessity for tuning the notes. It'll take whatever imprecise voltages we throw at it and force it to be an exact, musical note. This last little feature brought everything together, and the module feels so user friendly because of it. It's very simple to create something that sounds good. [We liked the quantiser feature a lot, and decided to spin the quantiser into it's own module, too](/quash/).

Bringing this all together, our block diagram looked something like this:

![Little Melody Block Diagram.]({{ site.url }}/assets/images/content/little-melody-block-diagram.png)
*Little Melody Block Diagram.*

# Conclusion

The final product - or the prototype of it, anyway - is incredibly fun to use. We found that if we just set the sliders (regular potentiometers on our prototype) to a few specific notes, that we would have a lot of fun to just start jamming with the division selectors. We periodically used the preset knob to select a base configuration to switch things up, and then varied the beat on that even more with the division selectors. Because we kept the sliders to the same position, our pattern had a fixed set of possible note - though they played in a varied order - and this lead to the changes in the pattern feeling like natural, intentional shifts.

A demo of Little Melody is below.

<blockquote class="twitter-tweet tw-align-center" data-conversation="none" data-dnt="true" data-theme="dark" data-link-color="#d05d5d"><p lang="en" dir="ltr">Some funky jams. 🎶 Damn, this thing is addictive. 💉 Just three modules in this tune!<br><br>Melodic Generator that uses clock divisions and CV mixing to make sick beats. <a href="https://t.co/2ZHshhV5ls">pic.twitter.com/2ZHshhV5ls</a></p>&mdash; Jet Holt (@JetroidMakes) <a href="https://twitter.com/JetroidMakes/status/1203838672308707328?ref_src=twsrc%5Etfw">December 9, 2019</a></blockquote>

At the time this article was written, Little Melody only exists as a rough prototype, so watch this space for more development, and information when we release it.

We're also creating a variation of Little Melody - we're calling it 'High Towers' - that acts as a pure clock divider, but keeping the innovative divider selections and modes. High Towers has an additional feature not found in Little Melody, where instead of outputting clock divisions, the module outputs a trigger after counting to the number specified by the divider's value - ie, a divider set to /8 triggers every 8th pulse. The trigger can be offset by changing the mode, so that it can trigger every 7th pulse in the set of 8, or every 6th pulse in the set of 8, etc. Should be interesting!

![Little Melody and High Towers panel visualisations.]({{ site.url }}/assets/images/content/little-melody-visualisation.jpg)
*Little Melody and High Towers panel visualisations.*