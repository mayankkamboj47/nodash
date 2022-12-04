# Nodash

A node based shell written for atrilabs assignment

## How to start

Execute `shell.js` using `node`. The shell will start. 

## Current pitfalls : 

The code structure can be improved lots ! We are using a lot of globals, callbacks. We could perhaps
think of reorganising the entire shell _AFTER_ coding, since we don't know what will work and what
won't right now, and also because the shell program itself is expected to remain pretty small and
easily reorganisable. 

I sense we're using some kind of "hacks", instead of doing things the way they're supposed to be done
when one creates a shell. The reason for this is, that if we are changing directories using cd, executing commands should _by default_ be in the current directory, instead of us having to force it to be that way using code. 