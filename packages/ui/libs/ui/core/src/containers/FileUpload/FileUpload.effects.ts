import { useEffect, useReducer, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { initialState, reducer } from './FileUpload.reducer';
import {
  ApiUploadFunction,
  FileUploadOnChangeFunction,
} from './FileUpload.types';

const FILE_SUPPORTED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export type TUseFileUploadEffectsArgs = {
  apiUploadFunction: ApiUploadFunction;
  onChange: FileUploadOnChangeFunction;
};

export const useFileUploadEffects = ({
  apiUploadFunction,
  onChange,
}: TUseFileUploadEffectsArgs) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: FILE_SUPPORTED_MIMETYPES,
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
  });

  const upload = async (file: File) => {
    const fileIndex = files.indexOf(file);

    const uploadedArray = await apiUploadFunction([file as Blob]);
    //   , {
    //   onUploadProgress: (progressEvent) => {
    //     dispatch({
    //       type: 'setFileProgress',
    //       payload: {
    //         id: fileIndex,
    //         uploadProgress: (progressEvent.loaded * 90) / progressEvent.total,
    //       },
    //     });
    //   },
    // });

    dispatch({
      type: 'setFile',
      payload: {
        id: fileIndex,
        file: {
          ...state[fileIndex],
          uploadedName: uploadedArray[0],
          cancelToken: null,
          uploadProgress: 100,
          cancelled: false,
        },
      },
    });
  };

  useEffect(() => {
    files.map((f) => {
      const fileIndex = files.indexOf(f);
      const uploadedFile = state && state[fileIndex];

      if (typeof uploadedFile === 'undefined') {
        dispatch({
          type: 'setFile',
          payload: {
            id: fileIndex,
            file: {
              uploadProgress: 0,
              removed: false,
              cancelled: false,
              uploadedName: null,
              cancelToken: null,
            },
          },
        });

        upload(f);
      }
    });
  }, [files]);
  useEffect(() => {
    onChange(Object.entries(state).map(([, value]) => value));
  }, [state]);

  return { getRootProps, getInputProps, files, state, dispatch };
};
