import { CancelTokenSource } from 'axios';

export type UploadedFile = {
  uploadedName: string;
  uploadProgress: number;
  cancelled: boolean;
  removed: boolean;
  cancelToken: CancelTokenSource;
};

export type FileUploadState = {
  [key: number]: UploadedFile;
};

export type FileUploadAction =
  | {
      type: 'setFile';
      payload: {
        id: number;
        file: UploadedFile;
      };
    }
  | {
      type: 'setFileProgress';
      payload: {
        id: number;
        uploadProgress: number;
      };
    }
  | {
      type: 'deleteFile';
      payload: {
        id: number;
      };
    }
  | {
      type: 'cancelFileUpload';
      payload: {
        id: number;
      };
    }
  | {
      type: 'setFileUploadCancelToken';
      payload: {
        id: number;
        cancelToken: CancelTokenSource;
      };
    };

export type ApiUploadFunction = (
  file: Blob[],
  options?: any
) => Promise<string[]>;

export type FileUploadOnChangeFunction = (files: UploadedFile[]) => void;
