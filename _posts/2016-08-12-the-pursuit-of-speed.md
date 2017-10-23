---
layout: post
title: "The Pursuit of Speed"
date: 2016-08-12 13:36:48 +0100
background: "speed-beauty.jpg"
summary: "A look at how I increased the speed of my Jekyll site. OR: How I almost wrote a CSS Minifier."
background-color: "#665745"
categories:
 - "Tutorials"
 - "Jekyll"
---
Following my [previous post](/meeting-dr-jekyll/),
I wanted to realistically look at how quick my site is,
and what specifically was slowing it down.
Google's [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)
is a tool that highlights issues on your pages.

My initial result was not great:

![The initial analysis of my site](/assets/images/speed-old.png)
*The initial analysis of my site*

To summarise: 
My images were not losslessly compressed,
and my CSS and Javascripts were in pages which required seperate download requests.
The tool also identified that the links on my homepage may be difficult to use on mobile.
My CSS and JS were also not compressed, which PageSpeed Insights didn't seem to pick up on.

To solve my compression issue, 
I wrote a [Rake](https://ruby.github.io/rake/) Task to losslessly compress all my images with Optipng and Jpegoptim.

```rake
SOURCE = "."
CONFIG = {
  'images' => File.join(SOURCE, "assets/images"),
}
# Usage: rake compress
desc "Compress all images (of type .jpg and .png) in #{CONFIG['images']}"
task :compress do
  abort("rake aborted: '#{CONFIG['images']}' directory not found.") unless FileTest.directory?(CONFIG['images'])
  Dir.chdir("#{CONFIG['images']}") do
    puts "Optimising PNGs"
    sh 'optipng -quiet -strip all -o3 *.png'
    puts "Optimising JPGs"
    sh 'jpegoptim -s -q *.jpg'
    puts "Done"
  end
end # task :compress 
```

I simply have to run this task before I commit any new images and they will automagically compress.

Next I wanted to look at minifying my CSS and JS. 
I'm using [jekyll-compress-html](https://github.com/penibelst/jekyll-compress-html)
to compress my HTML, and I wanted to see if I could find a solution for CSS and JS
(which didn't require the use of a custom plugin).
I couldn't, so resolved to start writing a CSS minifier in Liquid,
just like the jekyll-compress-html project.

I found Liquid very frustrating to work with;
things which should be easy were frustratingly hard.
My process for the CSS minify was as such:

1. Remove all comments
2. Identify Strings (Both " and ', but not nested strings or escaped quotes) and ignore them
3. Split on ':' within the innermost '{ }'s
4. Everything to the right of a ':' but before a ';' or '}' is a value and should be ignored 
(eg to not compress '20px 30px' to '20px30px')
5. Remove all whitespace from everything we didn't ignore.

This process should leave values and strings intact. 
I wasn't sure if it would work, and the only way to see would be to try.

![Correctly detecting Strings with Liquid](/assets/images/speed-strings.png)
*Correctly detecting Strings with Liquid*

I got pretty far with this, and was able to do steps 1 through 4. 
Whilst searching for a way to express a newline in Liquid,
I stumbled upon [this post](http://stackoverflow.com/questions/25815329/how-to-declare-newline-character-variable-in-liquid-template),
where rohit01 had been attempting the same thing,
only to be told that it is possible SASS natively with Jekyll,
which I too had overlooked.

Whoops! I guess I developed this for nothing! 
I was able to use SASS to quite happily compress my CSS.
I still haven't found a solution for Javascripts,
but as I am using them minimally on my base site 
(ignoring my more [gimmicky pages](/hacking/)),
it isn't much of a problem. 
I may one day adapt my CSS minification liquid code to minify Javascript,
but I find the idea of the task daunting as to do so properly would require
such things as inplace constant evaluation, or variable renaming,
and I think Liquid may be too limiting.

So now I had optimised images and compressed CSS.
I still needed to solve the fact that I was wasting time downloading 
the multiple stylesheets and javascripts.

I moved my [custom css includes script](https://gist.github.com/Jetroid/bd71e5bbc2de763d0973e706efc91d7c)
into it's own file, called main.scss, itself an include file. 
Able to include this from my 'default' layout, I completely inlined my CSS.
This stops the browser having to download it seperately. 
As my CSS is all relatively small (As will be almost all CSS I include on my site),
this doesn't cause any problems.

Unfortunately, SCSS wasn't minifying the include file. 
To fix this, I had to use liquid, like this: 

```html
{% raw %}{% capture includes %}
	{% include master.scss %}
{% endcapture %}
{{ includes | scssify }}{% endraw %}
```

Finally, I added line spacing to the text on my homepage to make my links easier to click on mobile.

![The final analysis of my site](/assets/images/speed-new.png)
*The final analysis of my site*

My use of GitHub Pages to host my site prevents me from leveraging browser caching,
leaving me at a respectable score of 98/100.
Like using HTTPS, it is a feature that is unsupported by GitHub Pages at this current time.
It's a limitation I'd rather not have, but considering I'm using free hosting,
I can't exactly complain.
