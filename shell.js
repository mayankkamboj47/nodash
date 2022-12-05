/**
 * 
 * ENOENT etc. should be communicated properly to the child process
 * 
 * add fg and Ctrl + Z
 * 
 * bug : echo "hi there" will get called as ['echo', '"hi', 'there"']
 */

const {spawn} = require('node:child_process');
const fs = require('fs');
const path = require('path');

// Globals
// Is there an alternative to using globals for communication ?
let currentProcess;
let curdir = process.cwd();         
const prompt = () => process.stdout.write(curdir + ">>> ");

// End of globals

console.log(
`
Welcome to nodash ! Currently we support the following commands :
ls, pwd, cd, exit, <path_to_node> args
`
);

prompt();
process.stdin.on('data', (r)=>{
    if(currentProcess) return;                        // ignore if some process is running already
    r = r.toString().split(/[ \t]/).map(r=>r.trim());
    if(r.every(x=>x==='')) return prompt();
    try {
        r = preprocess(r);
        console.log(r);
    }
    catch(e){
        console.log(e);
        return prompt();
    }
    if(!r) return prompt();
    currentProcess = createProcess(r);
    // if something goes wrong, free currentProcess and display the error
    currentProcess.on('error', (e)=>{console.error(e); currentProcess = undefined;});
});

function createProcess([command, ...args]){
    let p = spawn(command, args, {cwd : curdir});
    const killChild = ()=>p.kill('SIGINT') || p.kill('SIGKILL');    // try SIGINT before trying SIGKILL
    p.stdout.on('data', r=>process.stdout.write(r.toString()));
    p.stderr.on('data', r=>process.stderr.write(r.toString()));
    process.stdin.on('data', x=>p.stdin.write(x));

    process.on('SIGINT', killChild);
    p.on('close', ()=>{
        p.stdout.removeAllListeners();
        p.stderr.removeAllListeners();
        process.stdin.off('data', p.stdin.write);
        process.off('SIGINT', killChild);
        process.removeAllListeners();
        prompt();                                      // yet another prompt
        currentProcess = undefined;
    });
    return p;
}

function changeDir(d){
    d = path.resolve(curdir, d);
    if(fs.lstatSync(path.resolve(d)).isDirectory()) curdir = d;
    else throw new Error(`Directory ${d} doesn't exist`);
}

function preprocess(s){
    let specials = {
        'cd' : (r)=>changeDir((r.length > 1 && r[1]) || process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']),
        'exit': ()=>process.exit(0)
    };    
    let programs = {
        'pwd' : [1, __dirname],              // add jsdoc for this object
        'ls' : [1, '.'],                // command : [index of path argument, default path , ignore processing root]
    };

    if(s[0] in programs) {
        let [pathIndex, pth, ignore] = programs[s[0]] || [];
        if(!ignore) s[0] = path.resolve(__dirname, s[0]);
        if(pathIndex!==undefined) s[pathIndex] = path.resolve(curdir, s[pathIndex] || pth);
        s = ['node', ...s];
    } else if(s[0] in specials){
        specials[s[0]](s);
        return;
    }
    else if(s[0]=='node') {
        s[1] = path.resolve(curdir, s[1]);
        return s;
    }
    return s;
}