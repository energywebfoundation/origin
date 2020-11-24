export const FILE_SUPPORTED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export interface ISuccessResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
}

export const ResponseSuccess = (message?: string, statusCode?: number): ISuccessResponse => ({
    success: true,
    statusCode,
    message
});

export const ResponseFailure = (message?: string, statusCode?: number): ISuccessResponse => ({
    success: false,
    statusCode,
    message
});

export type onUploadProgressFunction = (progressEvent: ProgressEvent) => void;
