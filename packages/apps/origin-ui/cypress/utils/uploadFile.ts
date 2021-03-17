import * as testDoc from '../fixtures/testDocument.json';

export const uploadFile = async (): Promise<string[]> => {
    const fileUrl = `${Cypress.env('apiUrl')}/file`;
    const token = localStorage.getItem('AUTHENTICATION_TOKEN');

    const formData = new FormData();
    const str = JSON.stringify(testDoc);
    const bytes = new TextEncoder().encode(str);
    const blob = new Blob([bytes], {
        type: 'image/png'
    });
    formData.append('files', blob, 'document.png');

    const response = await fetch(fileUrl, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    let fileId: string[];
    response.json().then((res) => {
        fileId = res;
    });
    return fileId;
};
