# Nodash

A node based shell written for atrilabs assignment

## How to start

Execute `shell.js` using `node`. The shell will start. 

## Current pitfalls : 

SIGSTOP can't be listened on. Node.js doesn't support it. 
From  https://nodejs.org/api/process.html
> 'SIGSTOP' cannot have a listener installed.
I've not implemented SIGSTOP therefore. See planForFgBg.md to get a sense of how I would have done it, incase SIGSTOP was supported.

It's _not really_ a shell. For example, it doesn't support full fledged shell interface that
editors like vim expect. If you try running vim, it will complain that output is not going to a shell.

Bugs are written in comments at the start of shell.js

On windows, you can't use native commands you can typically use in powershell. 

# License

## Citations

A huge amount of help was taken from node.js documentation, mostly https://nodejs.org/api/process.html and https://nodejs.org/api/child_process.html, but also the tutorial and some other pages.
I also used stack overflow to reduce reading time from documentation
No other source from the internet was used. 