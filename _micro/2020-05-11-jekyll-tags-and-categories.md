---
title: Jekyll Tags and Categories
date: 2020-05-11 22:57:19 +0100
micro: true
categories:
 - "Micro"
---

Continuing on from [my post yesterday](/micro/jekyll-author-pages/) where I gave you code snippets to use to make a author pages, today I will give you snippets that are useful for making tags and categories pages.

**Tags and categories are implemented in the same way in Jekyll, so I will refer to both as 'tags'. To implement categories, simply replace the word 'tag' with 'category', and the code should all still work.**

# Setup

This guide takes advantage of Jekyll's [Collections](https://jekyllrb.com/docs/collections/) feature, and the fact that every item in a collection can be made to output a page.

A collection is just a set of files of the same type. you'll probably already be familiar with the built in `_posts` collection, for example!

###### Config

Open your `_config.yml` and add the following:

```
collections:
  tags:
    output: true
    permalink: tag/:title/

defaults:
  -
    scope:
      path: ""
      type: tags
    values:
      layout: tag


```

The first block (`collections`) defines `tags` as a new collection. It says that the files from the collection should be output (meaning that all files in the `_tags/` directory will map to pages on your site), and that the url for those pages should be `your.website.url/tag/title-of-your-file/`

The second block (`defaults`) says that all posts with the type `tags` (ie, anything in the `tags` collection) should use the `tag` layout, unless otherwise specified.

###### Tag Files

Now, let's create a file in our collection that tells Jekyll about one of our tags.

Create the `_tags` directory, and create a new file in that directory, `tag.md`, where `tag` is the name that will be used in the url. Make sure you don't use any capital letters.

I will be creating a tag about movies, so I will create the file `movies.md`. If I was creating a tag with multiple words, perhaps 'Things I Like', I should replace the spaces with dashes, ie `things-i-like.md`.

The contents of this file are very simple:

```
---
name: Movies
cover: assets/images/movies.jpg
---
These are my movie reviews!
```
The `name` should be what the name of the tag should look like to your reader - use capital letters, spaces, and punctuation!

The `cover` is the path to an image to use for the tag. This is optional, but I would recommend it to make your tag pages more interesting!

You'll need to create a file like this for every tag you want to use on your site. Remember to create new files when adding new tags!

###### Add Tags To Posts

This bit is simple!

Simply add `tags: movies` to the front matter of your post. Be sure to replace `movies` with the name of your tag. You can have more than one tag by creating an array like this:

`tags: [Movies, Things I Like, Reviews]`

Once done, your front matter might look something like this:

```
---
layout: post
title: Mad Max: Fury Road
date: 2015-05-15 16:00:00 +0100
tags: movies
---
```

# Edit Templates

If you've been following along properly, you're fully set up, and Jekyll knows information about your tags, and which tags each post has!

Lets get to work displaying that information in the HTML of our site!

### Post Written By

Let's start by editing the template used for our posts to let the readers know that a post has a given tag.

On my site, posts use the `post.html` layout (in the `_layouts/` directory), so I'll be editing that.

Everyone's `post.html` layout will be different, so I can only provide some code here.

Modify these snippets and include them wherever you want to link to the tags of a post. This will probably be in `post.html` layout, and perhaps even somewhere in your `index.html` to.

**NB: You may have to change `post` to `page` to get these snippets to work!**

This first snippet simply writes each tag (as hyperlinks to their author pages) to new lines, similar to the below:

[Movies](https://example.com/tag/movies/)

[Things I Like](https://example.com/tag/things-i-like/)

[Reviews](https://example.com/tag/reviews/)

This example is easy for you to modify to add your own customisations.

```
{% raw %}{% for tag in site.tags %}
    {% if post.tags contains tag.name or tag.name == post.tags %}
        <a href="{{ site.url }}{{ site.baseurl }}{{ tag.url }}">{{ tag.name }}</a>
    {% endif %}
{% endfor %}{% endraw %}
```

It simply iterates through every tag that jekyll knows about, and if they were one of the authors of our post, creates a new link to them.

Here's a more complex example, which prints the list of tags as a sentence with punctuation (example: [Movies](https://example.com/tag/movies/), [Things I Like](https://example.com/tag/things-i-like/), and [Reviews](https://example.com/tag/reviews/)).

```
{% raw %}{% assign tagdata = '' | split:'@' %}
{% for tag in site.tags %}
    {% if post.tags contains tag.name or tag.name == post.tags %}
        {% capture data %}
        	<a href="{{ site.url }}{{ site.baseurl }}{{ tag.url }}">{{ tag.name }}</a>
        {% endcapture %}
        {% assign tagdata = tagdata | push: data %}
    {% endif %}
{% endfor %}
<p>{{ tagdata | array_to_sentence_string }}</p>{% endraw %}
```

### Tag Template

Next, we want to create the template for our tag pages. This will be the template that is rendered when we go to the `/tag/movies/` URL.

Again, this will vary drastically from site to site, so I will just be including some useful snippets.

Note that all of the fields you created in your `_tags/tag.md` files are accessible here using the `page` variable. This could be useful if you want to have some unique data for each tag.

###### Page Header

A block of HTML including the tag's name and content.

```
<header>
    <h1 class="title">{{ page.name }}</h1>
    {% if page.content.size > 1 %}
	    <h2 class="description">
	        {{ page.content }}
	    </h2>
    {% endif %}
</header>
```

###### Tag Count

This snippet lists how many times a post has been tagged with this pages' tag.

```
{% raw %}{% assign number_of_posts = 0 %}
{% for post in site.posts %}
    {% if post.tags contains page.name or page.name == post.tags %}
        {% assign number_of_posts = number_of_posts | plus: 1 %}
    {% endif %}
{% endfor %}
{% if number_of_posts == 0 %}No posts{% elsif number_of_posts == 1 %}1 post{% else %}{{ number_of_posts }} posts{% endif %}{% endraw %}
```

###### Links to all of the posts for the tag

We might want to create a list of all of the posts that have been tagged with this pages' tag.

```
{% raw %}{% raw %}{% for post in site.posts %}
	{% if post.tags contains page.name or page.name == post.tags %}
		<a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
	{% endif %}
{% endfor %}{% endraw %}
```