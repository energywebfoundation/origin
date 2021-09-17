import { Box, Typography, TypographyProps } from '@material-ui/core';
import React, { FC } from 'react';
import { UploadChip } from '../../components/file';
import {
  useFileUploadEffects,
  TUseFileUploadEffectsArgs,
} from './FileUpload.effects';
import { useStyles } from './FileUpload.styles';

export interface FileUploadProps extends TUseFileUploadEffectsArgs {
  dropzoneText: string;
  heading?: string;
  headingProps?: TypographyProps;
  wrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >;
  dropzoneClassName?: string;
}

export const FileUpload: FC<FileUploadProps> = ({
  dropzoneText,
  apiUploadFunction,
  onChange,
  heading,
  headingProps,
  wrapperProps,
  dropzoneClassName,
}) => {
  const {
    getRootProps,
    getInputProps,
    files,
    state,
    dispatch,
  } = useFileUploadEffects({ apiUploadFunction, onChange });
  const classes = useStyles();
  const dropzoneClasses = `${classes.dropzone} ${dropzoneClassName}`;

  return (
    <Box>
      {heading && <Typography {...headingProps}>{heading}</Typography>}
      <section className={classes.wrapper} {...wrapperProps}>
        <div
          {...getRootProps({ className: dropzoneClasses })}
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
          <p className={classes.dropzoneText}>{dropzoneText}</p>
        </div>
        <aside className={classes.chipsContainer}>
          {files.map((file, index) => {
            const uploadedFile = state[index];

            if (!uploadedFile || uploadedFile.removed) {
              return null;
            }
            return (
              <UploadChip
                key={file.name + index}
                file={file}
                index={index}
                uploadedFile={uploadedFile}
                dispatch={dispatch}
              />
            );
          })}
        </aside>
      </section>
    </Box>
  );
};
