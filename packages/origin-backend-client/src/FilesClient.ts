import { CancelTokenSource } from 'axios';
import {
    IFilesClient,
    IRequestClient,
    onUploadProgressFunction
} from '@energyweb/origin-backend-core';
import { RequestClient } from './RequestClient';

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
                headers: {
                    ...this.requestClient.config.headers,
                    'Content-type': 'multipart/form-data'
                },
                onUploadProgress,
                cancelToken: cancelTokenSource?.token
            }
        );

        return response.data;
    }

    public async download(id:string): Promise<any> {
        const response = await this.requestClient.get<unknown, any>(`${this.endpoint}/${id}`, {
            responseType: 'blob'
        })
        return response   
    }

    public getLink(id: string) {
        return `${this.endpoint}/${id}`;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/file`;
    }
}
