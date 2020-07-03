---
title: Checking PDF links
summary: "A tutorial on how to bulk check links in a set of PDFs."
date: 2020-05-17 17:28:37 +0100
micro: true
categories:
 - "Micro"
---
Sometime last year, [Tayda](https://www.taydaelectronics.com/) changed their e-shop and many of their existing URLs stopped working. I won't make any comment on that, suffice to say that links breaking was specifically one of the things I tried hard to avoid when building the [new frequency central website](/new-frequency-central-website/).

Frequency Central links to Tayda in their build documents to specify what components a customer should buy. It's a problem for us if those links break, because customers won't know what to buy and might buy and incorrect component.

Fortunately, most links remained working, and only a few were broken. I set about trying to find the broken links.

I found [pdf-link-checker](https://pypi.org/project/pdf-link-checker/), which can be installed with `pip install pdf-link-checker`. This checks a single PDF file and makes a HTTP request to all of the links in the file. Perfect!

Then we just write a very simple bash script to process *all* of our pdf files.

```
for f in *.pdf; do
    echo "Processing $f file..";
    python2 /usr/bin/pdf-link-checker $f
done
```

...which we can run to find all of the dead links.

```
...
Processing Raging-Bull-Build-Doc.pdf file..
Processing Routemaster-Build-Document.pdf file..
ERROR: URL http://www.taydaelectronics.com/10-x-resistor-220-ohm-1-4w-1-metal-film-pkg-of-10.html failed. Reason: HTTP Error 404: Not Found
Processing Seismograf-Build-Doc.pdf file..
Processing Stasis-Leak-Build-Doc.pdf file..
...
```

Thus automating the detection part of the process, making it much simpler to correct all of the hyperlinks.

(I used [masterpdfeditor4](https://aur.archlinux.org/packages/masterpdfeditor-free/){: .no-cta } to edit the PDF links.)