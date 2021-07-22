import fs from 'fs';

const file = fs.readFileSync('./src/client/file.ts', 'utf8');

const newFile = file
    .replace(
        "      return fileControllerUploadMutator<Data extends unknown ? string[] : Data>({url: `/api/file`, method: 'post',",
        `
    const formData = new FormData();

    if (fileUploadDto.files) {
    fileUploadDto.files.forEach((element) => {
        formData.append('files', element as any);
    })
    }
    return fileControllerUploadMutator<Data extends unknown ? string[] : Data>({url: '/api/file', method: 'post',`
    )
    .replace(
        "      return fileControllerUploadAnonymouslyMutator<Data extends unknown ? string[] : Data>({url: `/api/file/public`, method: 'post',",
        `
    const formData = new FormData();

    if (fileUploadDto.files) {
    fileUploadDto.files.forEach((element) => {
        formData.append('files', element as any);
    })
    }
    return fileControllerUploadAnonymouslyMutator<Data extends unknown ? string[] : Data>({url: '/api/file/public', method: 'post',`
    )
    .replace(`      data: fileUploadDto`, `      data: formData`)
    .replace(`      data: fileUploadDto`, `      data: formData`);

fs.writeFileSync('./src/client/file.ts', newFile);
