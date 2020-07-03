---
title: Adding equations to your webpage
summary: "A quick guide to setting up MathJax on your webpage."
date: 2020-05-19 20:07:30 +0100
micro: true
categories:
 - "Micro"
 - "Tutorials"
custom_js:
 - https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js
---
If you work in mathematics or a mathematics adjacent field, eventually you're going to want to add an equation to your webpage.

If you're in one of those fields, more likely than not, you're familiar with LaTeX and it's equations.

[MathJax](https://github.com/mathjax/MathJax) is an open source JavaScript library that you can embed on to your page.

Simply add the following to the end of your HTML:

```
<script src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js' type="text/javascript"></script>
```

Then simply add some LaTex math notation to your document (between two set of `$$` for blocks of mathematics, and between `\(` and `\)` for inline mathematics):

```
$$
f(x)=\begin{cases}
    1  &: x \leq -1\\
    x  &: -1 < x < 1\\
    1  &: x \geq 1\\
\end{cases}
$$
```

...or some `\( \text{inline mathematics}: x \leq -1  \)`...

and when you load your page, MathJax will automatically convert them:

<div>
$$
f(x)=\begin{cases}
    1  &: x \leq -1\\
    x  &: -1 < x < 1\\
    1  &: x \geq 1\\
\end{cases}
$$
</div>

...or some \\( \\text{inline mathematics}: x \\leq -1 \\)

If you are writing your article in markdown, you might have to double up any backslashes for inline mathematics, because they are interpreted as an escape character. I'm writing this article in markdown, so the above inline mathematics actually looked like this:

```
\\( \\text{inline mathematics}: x \\leq -1 \\)
```

I did not have to make any changes to the block of mathematics, above.

Thanks to <a href="https://daniellockyer.com/" class="no-cta">Daniel Lockyer</a> for introducing me to MathJax.