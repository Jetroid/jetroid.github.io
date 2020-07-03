---
title: Move all untracked git files to their own directory
summary: "A bash one-liner to move all untracked git files to their own directory."
date: 2020-06-07 17:24:45 +0100
micro: true
categories:
 - "Micro"
---

I've been writing to this website from the same computer/install for almost two and a half years. Over the years, I've had drafts or ideas of posts that I intended to finish, but that I eventually gave up on or lost interested in, relegated to be finished at another time.

I store this site in git, so my drafts appeared as untracked files. I have to pay close attention to `git status` every time to try to filter out to just the new files or changes that I actually want. I also have to run `git stash` every time that I want to rebase. Yuck.

I didn't want to commit these drafts to a feature branch because my repository is publicly visible. I do want to track the files because I don't lose them. So let's make another private repo elsewhere to store my drafts in, then move the untracked files across.

Here's how to move all of your untracked git files somewhere else:

```
git status --porcelain | grep '^??' | cut -c4- | xargs mv -t /path/to/your/new/directory/
```

# Command Breakdown

Explained command by command:

`git status --porcelain` gives us the same output as a regular git status, but in a way that's easier for processing. Of note is that untracked files are preceded with `?? `.

`grep '^??'` just finds all of the files that start with '??'. ie, list only the untracked files

`cut -c4-` means to keep only from the 4th character onwards. ie, remove '?? ' from the start of the filename

`xargs mv -t /path/to/your/new/directory/` can be broken down into two parts.

We use `xargs` because you can't pipe files into `mv` (ie, `mv` can't accept files from the standard input). `xargs` lets us call `mv`, replicating the standard input as parameters.

`mv -t /path/to/your/new/directory/` is simply saying to move our files to the given directory. The `-t` is useful because we don't have to put the destination at the end. If we didn't have `-t`, `mv` would interpret our last untracked file as the destination.
