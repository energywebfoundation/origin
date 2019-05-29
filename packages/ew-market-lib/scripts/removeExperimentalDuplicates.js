const fs = require('fs');

const KEYWORDS = [
    {
        value: 'pragma experimental ABIEncoderV2',
        included: false
    },
    {
        value: 'pragma solidity',
        included: false
    }
];

const isKeyword = line => {
    for (const keyword of KEYWORDS) {
        if (line.includes(keyword.value)) {
            return true;
        } 
    }
    
    return false;
};

const getMatchingKeyword = line => {
    if (!isKeyword(line)) {
        throw "The line is not a keyword.";
    };

    for (const keyword of KEYWORDS) {
        if (line.includes(keyword.value)) {
            return keyword;
        } 
    }
};

const markIncluded = keyword => {
    KEYWORDS.find(kw => kw === keyword).included = true;
};

function main() {
    const filename = process.argv[2];
    
    const oldFile = fs.readFileSync(filename).toString().split("\n");
    const newFile = [];
    
    for (const line of oldFile) {    
        if (isKeyword(line)) {
            const matchingKeyword = getMatchingKeyword(line);
            if (!matchingKeyword.included) {
                newFile.push(line);
                markIncluded(matchingKeyword);
            }
        } else {
            newFile.push(line)
        }
    }
    
    fs.writeFileSync(filename, newFile.join('\n'));
  }
  
  main();