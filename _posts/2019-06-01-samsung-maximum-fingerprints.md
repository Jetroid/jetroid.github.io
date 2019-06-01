---
layout: post
title: "Store More Than The Maximum Fingerprints In Your Samsung Phone"
date: 2019-06-01 14:57:34 +0800
background: "fingerprints-beauty.jpg"
background-color: "#595C5D"
summary: "A cheeky workaround to Samsung's maximum fingerprint scans limit."
categories:
 - "Tutorials"
---

**I recently bought the Samsung Galaxy A7, which comes with a fingerprint scanner built into the power button (on the right side of the phone). Unfortunately I found that I could only store three fingerprints at once. I came up with a workaround.**

![Samsung Galaxy A7]({{ site.url }}/assets/images/content/fingerprints-phoneoff.jpg)

# Background

My girlfriend owns the same phone, and had seen that she tends to unlock it very quickly with the fingerprint scanner - it would seamlessly unlock as she touched the power button. I purchased the same phone as her because I liked the features it had.

I was eager to use the fingerprint , and started scanning each of my fingers - but found I could only scan three fingers! What the hell! I have ten fingers!

I started looking for a way that I could scan more than three fingerprints in to my Samsung phone online, but found no helpful results. It looked like it might be a hardware limitation - it only has the secure, on-chip storage space for three prints. (I read that even the top of the line Samsung S10 can only store four fingerprints).

![Samsung Galaxy A7 turned on by fingerprint.]({{ site.url }}/assets/images/content/fingerprints-phoneon.jpg)

I have some (basic) idea of how fingerprint scanners work because of my general curiosity about technology. Unlike you see in movies, fingerprint scanners do not compare the scan to a full picture of the finger and check for overlap - this would be unreliable and error prone. Instead, they compare how different ridges meet, split, and all manner of other indicators about the shape, without actually looking at spacing. It's more "can I build a comparable [graph](https://en.wikipedia.org/wiki/Graph_theory) of the features" than "can I overlap these in any way and see a match?". Simplified explanation, obviously.

I suspected that either they use the individual scans to build individual 'graphs', or they match and cross-reference the scans to build a single model of the whole fingerprint. After seeing how this phone records the fingerprints - you input random, thin slices of fingerprint onto the 2mm by 14mm scanner - I suspected that they would not build a model of the fingerprint, instead comparing the individual slices to the unlock attempt scan... this means I can try to store two fingerprints into the same slot and see what happens! I tried my plan and it worked!

# Tutorial

Unfortunately, the maximum number of fingerprints that your phone is allowing you to input is because of a hardware limitation. It only has secure storage for that many fingerprint scans. The idea here is that we're going to "cheat" and scan two fingerprints into one slot, effectively doubling the number of fingers you can store.

## Observe How You Hold Your Phone

Play with your phone a little and look at how your different fingers touch the scanner from different positions. Go on, pick it up! Pick it up from the desk. From your pocket. From your bag. Go to press the fingerprint scanner with each of the easily accessible fingers for each holding position. Turn on the screen whilst it is stationary on the desk.

Look at which parts of your fingertips actually touches the scanner for each of your different fingers in the different positions and actions. Take note of this or keep it in mind. Those are the parts of the finger you want to scan. (For instance, I find that for the thumb on my right hand, when looking at my palm, the edge of my thumb that is closest to my body never touches the scanner. No use scanning that part, then!)

![Here's the parts of my fingerprints that touch the scanner when I turn on my phone in different positions (including with the phone sitting on various objects).]({{ site.url }}/assets/images/content/fingerprints-idea.png)
*Here's the parts of my fingerprints that touch the scanner when I turn on my phone in different positions (including with the phone sitting on various objects).*

This will differ for different hand, grip, and phone combinations, so do your own experimentation!

## Erase Any Existing Fingerprints

Sorry, but any time you spent recording fingerprints is wasted as we are going to be overwriting them. 

On the fingerprint scanner screen, tap 'edit', select all the fingerprints, and then tap 'remove'. 

![Tap 'Edit'.]({{ site.url }}/assets/images/content/fingerprints-edit.jpg)
*Tap 'Edit'.

Select all fingerprints, then tap 'remove'.

![Select all, and tap 'Remove'.]({{ site.url }}/assets/images/content/fingerprints-remove.jpg)
*Select all, and tap 'Remove'.*

## Start Registering A New Fingerprint

Making sure to prioritise the parts of the finger that touch the scanner most often, begin to scan the fingerprint. Pause when the screen shows 50% scan. 

![Scan your first finger up to 50% and then stop.]({{ site.url }}/assets/images/content/fingerprints-0.gif)
*Scan your first finger up to 50% and then stop.*

## Pause at 50%, and Switch To Another Finger

Do the same for the next fingerprint, completing the scan of the 'fingerprint'.

![Scan your second finger to completion.]({{ site.url }}/assets/images/content/fingerprints-50.gif)
*Scan your second finger to completion.*

## Test the scan

You can do this by locking and unlocking the phone, but I found that an easier way is to use the Fingerprint Scanner tool itself. When you touch your fingers to the scanner (at least on my phone), the fingerprint that it is 'registered to' should highlight in blue. If one of the fingers you registered doesn't scan very well, try to scan again. 

![Test your scan by putting your fingerprints on the sensor in different positions.]({{ site.url }}/assets/images/content/fingerprints-test.gif)
*Test your scan by putting your fingerprints on the sensor in different positions.*

## Tip

You don't have to go for a 50/50 split between the two fingers. If there's a finger you use more (in my case, my right thumb), you could choose to do a 75/25 split with a finger you use less often (like my left, ring finger.) Or you could choose to dedicate a whole slot to the fingerprint (as Samsung originally intended).

## Does it work well?

I've been using this method for the past three days with no real problems - all seven (yes, seven - I did only 25% scans for the middle and ring fingers on my left hand) fingers scan, though occasionally it does take a little repositioning to hit the sweet spot (particularly on the 25% scans). I intend to stick with this method - it's working well for me and I can't imagine only being able to unlock my phone with the three fingers.

If using a fingerprint scanner is safe, well, <span><a href="https://www.zdnet.com/article/hackers-can-remotely-steal-fingerprints-from-android-phones/">that's a different question</a></span>.