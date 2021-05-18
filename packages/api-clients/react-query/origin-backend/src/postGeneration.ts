import fs from 'fs';

const file = fs.readFileSync('./src/client/file.ts', 'utf8');

const newFile = file
    .replace(
        `formData.append('files', JSON.stringify(fileControllerUploadBody.files))`,
        `if (fileUploadDto.files) {
        fileUploadDto.files.forEach((element) => {
            formData.append('files', element as any);
        })
    }`
    )
    .replace(
        `formData.append('files', JSON.stringify(fileControllerUploadAnonymouslyBody.files))`,
        `if (fileUploadDto.files) {
        fileUploadDto.files.forEach((element) => {
            formData.append('files', element as any);
        })
    }`
    );

fs.writeFileSync('./src/client/file.ts', newFile);
