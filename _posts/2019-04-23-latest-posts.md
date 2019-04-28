---
layout: post
title: "How to create a page that always shows your most recent post on Jekyll"
date: 2019-04-23 19:57:32 +0800
summary: "A tutorial on how to create a permanent URL that points to whatever post was published most recently"
categories:
 - "Tutorials"
 - "Jekyll"
---

**Want to have a page on your Jekyll site that always shows your most recent post? This tutorial will show you how to create a URL that always shows your latest post with Jekyll. Click [here](#tutorial) to skip the preface.**

I send out an email that looks like this at the end of any week when I upload a post to this website:

![Email notifying my subscribers that I published a post.]({{ site.url }}/assets/images/content/latestposts-email.jpg)
*Email notifying my subscribers that I published a post.*

There are links to any posts published this week, as well as the most recent 3 posts from previous weeks. There's also a big red button labelled 'View All Posts', which takes you to my homepage. I designed this email in 2017 when there were only 13 posts on the website. I'm now at 52 posts, and I realised that the flow of the email is bad.

I saw on my analytics that some users consistently clicked the big, shiny red button to go to the homepage, rather than clicking the individual links to go to the new posts. So they probably have to make an additional click to get to the content they want. 

We've been conditioned to think that the big, attractive button will do what we want; in this case, that would be 'go to the latest post'. My button didn't do that; bad design on my part because I misused a common design feature. I want to make the email more useful, so realistically I have two choices; either I remove the red button - which I feel will hurt the aesthetics of the email - or make the red button more useful by making it link to the most recent post.

I decided that it would be useful to have a [/latest/](/latest/) page that the button would link to; a page that would always shows the most recent post. I feel that it's more natural to do it this way than other approaches, like a fixed link in the email to the most recent post at the time of publishing. The dynamic link means that the email continues to be up to date even if update between the email being send and the link being clicked.

This link could also be bookmarked by my users and used to quickly check if I have updated or not.

# Tutorial

*This tutorial only works if all blog posts use the same layout. That is to say, all files in `_posts` have the same value set for `layout:` in their front matter.*

Your blog has a file in `_layouts/` called `post.html` (or something similar), which contains the layout for your blog posts. It defines how they should look as individual pages. Your file may be called something different - you can find out what it is called by looking at a blog post (any file in `_posts/`), and on one of the first few lines, it will say something like `layout: xyz`. Your file will be called `xyz.html` in `_layouts/`. We'll refer to this file as `post.html`. 

A very, very basic version of the `post.html` might look like this:

```
{% raw %}---
layout: default
background: "background-blog.jpg"
background-color: "#848485"
---
<div id="head">
	<h1>{{ page.title }}</h1>
	<p>{{ page.date }}</p>
</div>
<article>
	{{ content }}
</article>
{% endraw %}
```

It has a YAML front matter (that's the code between (and including) the pair of '`---`'). The YAML front matter defines variables used elsewhere.

Below this, it has HTML peppered with liquid logic (like `{% raw %}{{ page.title }}{% endraw %}` and `{% raw %}{{ content }}{% endraw %}`). Your file might even have some CSS and JS in there too, depending on how your site is set up.

To create our [/latest/](/latest/) page, we essentially want to duplicate the contents of our `posts.html` file. Actually duplicating the content would be bad - if we wanted to update our blog layout in the future, we'd have to remember to update both files - so we are going to create a file in `_includes/` and instead move all of the content to there. Files in `_includes/` can be 'included' (clue is in the name!) to our other files, meaning we can reuse the same code several times.

Let's create a file in `_includes/` called `blog.html`. Now, cut all of the content below the YAML front matter (everything below the second `---`) from `_layouts/post.html` and paste it into `_includes/blog.html`. Where the content was removed from, we can simply write instead `{% raw %}{% include blog.html %}{% endraw %}`.

So now we have two files:

*_layouts/post.html*

```
{% raw %}---
layout: default
background: "background-blog.jpg"
background-color: "#848485"
---
{% include blog.html %}
{% endraw %}
```

*_includes/blog.html*

```{% raw %}
<div id="head">
	<h1>{{ page.title }}</h1>
	<p>{{ page.date }}</p>
</div>
<article>
	{{ content }}
</article>
{% endraw %}
```

Next, let's create the file that will create the [/latest/](/latest/) link. Create `latest.html` in the root of your Jekyll project. The content will be incredibly simple. Copy `_layouts/post.html` in it's entirety. Now, add `{% raw %}{% for post in site.posts limit:1 %}{% endraw %}` on the line above `{% raw %}{% include blog.html %}{% endraw %}`, and `{% raw %}{% endfor %}{% endraw %}` on the line below.

*latest.html*

```
{% raw %}---
layout: default
background: "background-blog.jpg"
background-color: "#848485"
---
{% for post in site.posts limit:1 %}
{% include blog.html %}
{% endfor %}
{% endraw %}
```

Now, there's a slight problem. the content in `blog.html` is expecting to refer to everything as `page.` - but we can't do that for `latest.html`, as `page` refers to `latest.html`, not `post`, and rebinding it would cause problems. So we actually need to go into `blog.html` and replace all the `page.` with `post.`. You also need to add `post.` in front of `content`.

*_includes/blog.html*

```{% raw %}
<div id="head">
	<h1>{{ post.title }}</h1>
	<p>{{ post.date }}</p>
</div>
<article>
	{{ post.content }}
</article>
{% endraw %}
```

Finally, `_layouts/post.html` doesn't refer to `post` at all (because everything is in `page`), but it's okay to bind `post` here. Add `{% raw %}{% assign post = page %}{% endraw %}` above `{% raw %}{% include blog.html %}{% endraw %}`.

*_layouts/post.html*

```
{% raw %}---
layout: default
background: "background-blog.jpg"
background-color: "#848485"
---
{% assign post = page %}
{% include blog.html %}
{% endraw %}
```

And we're done...! You should be able to visit [/latest/](/latest/) (or latest.html if you aren't using pretty urls) to view your latest post.

I hope this quick tutorial helped.

