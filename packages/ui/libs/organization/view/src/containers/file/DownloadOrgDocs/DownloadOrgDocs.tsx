import { DownloadableChip } from '@energyweb/origin-ui-core';
import { fileUDownloadHandler } from '@energyweb/origin-ui-organization-data';
import React, { FC } from 'react';
import { useStyles } from './DownloadOrgDocs.styles';

export interface DownloadOrgDocsProps {
  documents: string[];
  blockTitle: string;
}

export const DownloadOrgDocs: FC<DownloadOrgDocsProps> = ({
  documents,
  blockTitle,
}) => {
  const classes = useStyles();
  return (
    <aside className={classes.thumbsContainer}>
      {documents.map((documentId, index) => (
        <DownloadableChip
          key={documentId}
          downloadFunc={fileUDownloadHandler}
          documentId={documentId}
          name={blockTitle}
          label={`${
            documents.length > 1
              ? `${blockTitle} ${index + 1}`
              : `${blockTitle}`
          }`}
        />
      ))}
    </aside>
  );
};
