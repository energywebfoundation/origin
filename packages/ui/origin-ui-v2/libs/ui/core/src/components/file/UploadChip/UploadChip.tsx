import { Chip } from '@material-ui/core';
import { Cancel, Delete, Replay } from '@material-ui/icons';
import React, { Dispatch, FC } from 'react';
import { FileUploadAction, UploadedFile } from '../../../containers/FileUpload';

export interface UploadChipProps {
  file: File;
  index: number;
  uploadedFile: UploadedFile;
  dispatch: Dispatch<FileUploadAction>;
  upload: (file: File) => Promise<void>;
}

export const UploadChip: FC<UploadChipProps> = ({
  file,
  index,
  uploadedFile,
  dispatch,
  upload,
}) => {
  const chipLabel = `${
    file.name.length > 20 ? file.name.slice(0, 20) + '...' : file.name
  }${uploadedFile.cancelled ? ' (Cancelled, click to retry)' : ''}`;

  const chipIcon = uploadedFile.cancelled ? <Replay /> : null;

  const chipDeleteIcon =
    uploadedFile.uploadedName || uploadedFile.cancelled ? (
      <Delete color="error" />
    ) : (
      <Cancel color="error" />
    );

  const clickHandler = () => {
    if (!uploadedFile.cancelled) return;
    upload(file);
  };

  const deleteHandler = () => {
    if (uploadedFile.uploadedName || uploadedFile.cancelled) {
      dispatch({
        type: 'deleteFile',
        payload: {
          id: index,
        },
      });
    } else {
      uploadedFile.cancelToken.cancel();

      dispatch({
        type: 'cancelFileUpload',
        payload: {
          id: index,
        },
      });
    }
  };

  return (
    <>
      <Chip
        variant="outlined"
        color="primary"
        label={chipLabel}
        icon={chipIcon}
        deleteIcon={chipDeleteIcon}
        clickable={uploadedFile.cancelled}
        onClick={clickHandler}
        onDelete={deleteHandler}
        // style={{
        //     background: `-webkit-linear-gradient(left, ${
        //         uploadedFile.cancelled ? lightenBgColor : bgColorLight
        //     } ${
        //         uploadedFile.cancelled ? '100' : uploadedFile.uploadProgress
        //     }%, rgba(255, 255, 255, 0) 0%)`,
        //     cursor: uploadedFile.cancelled ? 'pointer' : 'default'
        // }}
        key={index}
      />
    </>
  );
};
