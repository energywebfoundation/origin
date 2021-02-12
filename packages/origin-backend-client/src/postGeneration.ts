import fs from 'fs';

const file = fs.readFileSync('./src/api.ts', 'utf8');

// Fixes an issue where attaching multiple files to FormData doesn't work
const newFile = file.replace(
    `localVarFormParams.append(files.join(COLLECTION_FORMATS.csv));`,
    `files.forEach(file => localVarFormParams.append('files', file));`
);

fs.writeFileSync('./src/api.ts', newFile);
