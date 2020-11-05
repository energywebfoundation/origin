export const FILE_SUPPORTED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export interface ISuccessResponse {
    success: boolean;
    message?: string;
}

export const ResponseSuccess = (message?: string): ISuccessResponse => ({
    success: true,
    message
});

export const ResponseFailure = (message?: string): ISuccessResponse => ({
    success: false,
    message
});

export type onUploadProgressFunction = (progressEvent: ProgressEvent) => void;
