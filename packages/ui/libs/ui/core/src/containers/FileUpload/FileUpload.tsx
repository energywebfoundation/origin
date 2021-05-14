// @should-localize
import React, { FC } from 'react';
import { UploadChip } from '../../components/file';
import {
  useFileUploadEffects,
  TUseFileUploadEffectsArgs,
} from './FileUpload.effects';
import { useStyles } from './FileUpload.styles';

export interface FileUploadProps extends TUseFileUploadEffectsArgs {}

export const FileUpload: FC<FileUploadProps> = ({
  apiUploadFunction,
  onChange,
}) => {
  const {
    getRootProps,
    getInputProps,
    files,
    state,
    dispatch,
    upload,
  } = useFileUploadEffects({ apiUploadFunction, onChange });
  const classes = useStyles();

  return (
    <section>
      <div
        {...getRootProps({ className: classes.dropzone })}
        style={{
          ...(getRootProps().style as React.CSSProperties),
        }}
      >
        <input
          {...getInputProps()}
          style={{
            ...(getInputProps().style as React.CSSProperties),
          }}
        />
        <p>Drop here or click to select files</p>
      </div>
      <aside className={classes.chipsContainer}>
        {files.map((file, index) => {
          const uploadedFile = state[index];

          if (!uploadedFile || uploadedFile.removed) {
            return null;
          }
          return (
            <UploadChip
              key={file.name}
              file={file}
              index={index}
              uploadedFile={uploadedFile}
              dispatch={dispatch}
              upload={upload}
            />
          );
        })}
      </aside>
    </section>
  );
};
