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
