/**
 * Bugs : 
 * EventEmitter memory leak. Are we forgetting to unassign memory somewhere ? 
 * To reproduce, use the terminal for a long time, and use node, cd back and forth.
 * 
 * 
 */

const {spawn} = require('node:child_process');
const fs = require('fs');
const path = require('path');
const showShellPrompt = () => process.stdout.write("> ");

let currentProcess;
let curdir = process.cwd();
let aliases = {
    'ls' : (r)=>r.length > 1 ? ['node', 'ls', path.resolve(curdir,r[1])] : ['node', 'ls', curdir],
}
let specials = {
    '' : ,
    'pwd': ()=>process.stdout.write(curdir),
    'cd' : (r)=>changeDir((r.length > 1 && r[1]) || process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']),
    'exit': ()=>process.exit(0)
};
showShellPrompt();
process.stdin.on('data', (r)=>{
    if(currentProcess) return;
    r = r.toString().split(/[ \t]/).map(r=>r.trim());
    if(r.every(x=>x==='')) return showShellPrompt();
    if(r[0] in specials){
        specials[r[0]](r);
        return showShellPrompt();
    } 
    if(r[0] in aliases) r = aliases[r[0]](r);
    console.log(r);
    currentProcess = createProcess(r);
    currentProcess.on('error', (e)=>{console.error(e); currentProcess = undefined;});
});


function createProcess([command, ...args]){
    let p = spawn(command, args);
    const killChild = ()=>p.kill('SIGINT') || p.kill('SIGKILL');
    p.stdout.on('data', r=>process.stdout.write(r.toString()));
    p.stderr.on('data', r=>process.stdout.write(r.toString()));
    process.stdin.on('data', x=>p.stdin.write(x));

    process.on('SIGINT', killChild);
    p.on('close', ()=>{
        p.stdout.removeAllListeners();
        p.stderr.removeAllListeners();
        process.stdin.off('data', p.stdin.write);
        process.off('SIGINT', killChild);
        process.removeAllListeners();
        showShellPrompt();
        currentProcess = undefined;
    });
    return p;
}

function changeDir(d){
    // note : d can be an absolute path, or a relative one. Make it absolute
    d = path.resolve(curdir, d);
    if(fs.lstatSync(path.resolve(d)).isDirectory()) curdir = d;
    else throw new Error(`Directory ${d} doesn't exist`);
}