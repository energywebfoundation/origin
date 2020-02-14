import { CancelTokenSource } from 'axios';
import { IRequestClient, RequestClient } from './RequestClient';

type onUploadProgressFunction = (progressEvent: ProgressEvent) => void;

export interface IFilesClient {
    upload(
        files: File[] | FileList,
        onUploadProgress?: onUploadProgressFunction,
        cancelTokenSource?: CancelTokenSource
    ): Promise<string[]>;
    getLink(id: string): string;
}

export class FilesClient implements IFilesClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async upload(
        files: File[] | FileList,
        onUploadProgress?: onUploadProgressFunction,
        cancelTokenSource?: CancelTokenSource
    ) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append(`files`, files[i]);
        }

        const response = await this.requestClient.post<FormData, string[]>(
            this.endpoint,
            formData,
            {
                headers: { 'Content-type': 'multipart/form-data' },
                onUploadProgress,
                cancelToken: cancelTokenSource.token
            }
        );

        return response.data;
    }

    public getLink(id: string) {
        return `${this.endpoint}/${id}`;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/file`;
    }
}
