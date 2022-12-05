# Plan for foreground and background processes

Here is a way to add support for foreground and background processes :

Add a listener for SIGSTOP, which deregisters event handlers from the current process and then sticks currentProcess inside an object store, with PID as key and the child process as value. Now free `currentProcess`. This object store also has `-1` as key, which stores a queue of PIDs. This will be handy when someone calls fg. Just go to the store, get the first pid from the queue, and bring it to the foreground. I chose -1 because it is an invalid PID, and I didn't want to use another variable to store the last PID. 

When one sticks a PID in the store, one has to remember to also update the queue - unless we turn the store into an object which turns this into a single step. 