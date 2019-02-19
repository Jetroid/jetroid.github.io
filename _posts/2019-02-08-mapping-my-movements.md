---
layout: post
title: "Mapping My Movements"
date: 2019-02-08 19:41:21 +0800
background: "trips.jpg"
background-color: "#25232A"
summary: "I create an interactive 3D visualisation of my travels around our world."
categories:
 - "Projects"
---
**Before I [left home to start travelling](/the-adventure-begins/), I had wanted some way to visually represent [my journey](/travel/) for my family and friends. In particular, my little brother is too young to know where some of the places I'd be visiting are, so I felt it would be nice to make something that he could interact with to better understand where I am and where I have been.**

I finished [Jet's Trips](/trips/) today, an interactive map of my travels. I made it with [CesiumJS](https://cesiumjs.org/), an open source 3D mapping tool, and I'm super happy with the result.

![The finished product.]({{ site.url }}/assets/images/content/trips.jpg)
*The finished product.*

I was really inspired by [Pieter's](https://levels.io/) implementation of [trips](https://nomadlist.com/@levelsio) for his users on [NomadList](https://nomadlist.com). I wanted to take the idea and add my own vision to it, like using a globe rather than a 2D map, colour-coding the arcs to represent the mode of transport I used, and being able to write prose about a place or link to my posts that I wrote about there. And rather than using generic locations, I can tailor the arcs to point directly to the airports, train stations, etc that I used, better representing my journey.

There were a few ideas that didn't quite make it into the finished product, which I'm a little sad about. My arcs use the CesiumJS [PolylineGlowMaterialProperty](https://cesiumjs.org/Cesium/Build/Documentation/PolylineGlowMaterialProperty.html), and I was hoping I'd be able to make the 'glow power' higher for more recent trips to make visualising the chronology easier on the globe. Sadly, I had misunderstood how 'Glow Power' worked, and it turned out I didn't like the result of that when I implemented it. So we don't have this feature. 

![Trips WIPs.]({{ site.url }}/assets/images/content/trips-wip1.jpg)

![Trips WIPs.]({{ site.url }}/assets/images/content/trips-wip.jpg)
*Trips WIPs.*

There are a few more things I could add to this, for example overlaying my pictures as pins on to the globe when you zoom on a location I visited, but for now the current functionality is acceptable so I don't expect to make modifications in the immediate future. 

# How To Implement Trips

If you want to make something like this yourself, here is a brief guide:

1. Decide you want to create an interactive map of your past and future travels.

2. Research online mapping tools. Pick one that looks cool. Or maybe at random - they're probably all very similar, let's be honest.

3. Trawl through your archives to try to find out when you made trips to different places, construct a JSON list of what you find so that you can use the structured data later.

4. Look up online how to draw an arc from one place to the other on the planet in your mapping tool. Find a several year old answer on some obscure forum that talks about things you have no idea about, like Hermite Splines, Polylines, and Geodetic Surfaces. Get confused and dive into a rabbit hole learning about these things. Write some hacky code that sort-of-works.

5. Get bored and abandon the project.

6. ???

7. After a year or more, decide you want to go back to your old code and finish that interactive map of your past and future travels.

8. Find that your code you wrote doesn't work at all for some reason, despite not updating the library or updating the code in any way. Throw it all out and start again. 

9. Update your structured data format with your new trips. Decide to alter the format completely, end up with something harder to work with.  

10. Look up online how to draw an arc from one place to the other on the planet in your mapping tool. Find a recent answer that is simple and works pretty much instantly.

11. Customise the display of the arcs to your liking.

12. Throw in an incredibly simple UI to help improve the interactivity.

13. [Post about it on twitter](https://twitter.com/JetroidMakes/status/1092791262690701312). Feel disappointed when it only gets like two clicks.

14. Write a blog posts about the experience.