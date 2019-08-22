const fs = require('fs');

const filename = process.argv[2];
const keyword = 'pragma experimental ABIEncoderV2;';

const oldFile = fs.readFileSync(filename).toString().split("\n");
const newFile = [];

let found = false;

for (const line of oldFile) {
    if (line !== keyword) {
        newFile.push(line);
    } else if (found === false) {
        newFile.push(line);
        found = true;
    }
}

fs.writeFileSync(filename, newFile.join('\n'));