import { FileUploadAction, FileUploadState } from './FileUpload.types';

export const initialState: FileUploadState = {};
export const reducer = (
  state: FileUploadState,
  action: FileUploadAction
): FileUploadState => {
  switch (action.type) {
    case 'setFile':
      return { ...state, [action.payload.id]: action.payload.file };
    case 'deleteFile':
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], removed: true },
      };
    case 'cancelFileUpload':
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          cancelled: true,
          uploadProgress: 0,
          uploadedName: null,
          cancelToken: null,
        },
      };
    case 'setFileProgress':
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          uploadProgress: action.payload.uploadProgress,
        },
      };
    case 'setFileUploadCancelToken':
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          cancelToken: action.payload.cancelToken,
          cancelled: false,
        },
      };
  }
};
