---
title: Programmatically Merging SVG files
summary: "An outline of a python script to help you merge two SVG files."
date: 2020-06-02 23:26:48 +0100
micro: true
categories:
 - "Micro"
---
Sometimes, we might want to programmatically merge two or more SVG files to product a single SVG file. Perhaps we're adding a logo to every file, or want every file to be on a given background.

My first instinct was to use imagemagick's [composite](https://imagemagick.org/script/composite.php) for this, but it mangled by SVG files in very strange ways, despite the suite claiming to work with SVG files.

Instead, we can use [svg_utils](https://github.com/btel/svg_utils), a python library, to do the task for us.

Here's a simple python script using the [transform](https://svgutils.readthedocs.io/en/latest/transform.html) tool, that overlays a logo on to a background image at each of the four corners.

```
import svgutils.transform as sg
import sys
import re

background = sg.fromfile('background.svg')
logo = sg.fromfile('logo.svg')

def convert_to_pixels(measurement):
    value = float(re.search(r'[0-9\.]+', measurement).group())
    if measurement.endswith("px"):
        return value
    elif measurement.endswith("mm"):
        return value * 3.7795275591
    else:
        # unit not supported
        return value

width = convert_to_pixels(background.get_size()[0])
height = convert_to_pixels(background.get_size()[1])
logo_width = convert_to_pixels(logo.get_size()[0])
logo_height = convert_to_pixels(logo.get_size()[1])

root = logo.getroot()

# Top Left
root.moveto(1, 1)

# Top Right
#root.moveto(width - logo_width - 1, 1)

# Bottom Left
#root.moveto(1, height - logo_height - 1)

# Bottom Right
#root.moveto(width - logo_width - 1, height - logo_height - 1)

background.append([root])

background.save('output.svg')
```

You may have to try some trial and error to get your SVG to appear on the background image in the location you desire. The library seems to handle units inconsistently in my experience.

The [docs](https://svgutils.readthedocs.io/en/latest/transform.html#svgutils.transform.FigureElement.moveto) say that the units are in pixels, but for me they were in millimeters, so I suspect that this may depend on which unit you were using to position the elements when the documents were saved.

Some SVG files I tried didn't even return a unit for .get_size() too, which was weird.

Hopefully this provides a good starting point for your experiments. I was able to create a script that did what I needed.