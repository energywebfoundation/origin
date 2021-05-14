import fs from 'fs';

const file = fs.readFileSync('./src/client/file.ts', 'utf8');

const regularUploadReplaced = file.replace(
    `formData.append('files', JSON.stringify(fileControllerUploadBody.files))`,
    `formData.append('files', JSON.stringify(fileUploadDto.files))`
);
const bothUploadsReplaced = regularUploadReplaced.replace(
    `formData.append('files', JSON.stringify(fileControllerUploadAnonymouslyBody.files))`,
    `formData.append('files', JSON.stringify(fileUploadDto.files))`
);

fs.writeFileSync('./src/client/file.ts', bothUploadsReplaced);
