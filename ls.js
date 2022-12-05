const fs = require('fs').promises;
// directory path
const dir = process.argv[2];

// list all files in the directory
fs.readdir(dir).then(r=>console.log(r.join('\n'))).catch(console.error);