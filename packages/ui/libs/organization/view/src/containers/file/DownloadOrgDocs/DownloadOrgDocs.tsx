import { DownloadableChip } from '@energyweb/origin-ui-core';
import { fileDownloadHandler } from '@energyweb/origin-ui-organization-data';
import React, { FC } from 'react';
import { useStyles } from './DownloadOrgDocs.styles';

export interface DownloadOrgDocsProps {
  documents: string[];
  blockTitle: string;
  dataCy?: string;
}

export const DownloadOrgDocs: FC<DownloadOrgDocsProps> = ({
  documents,
  blockTitle,
  dataCy,
}) => {
  const classes = useStyles();
  return (
    <aside className={classes.thumbsContainer}>
      {documents.map((documentId, index) => (
        <DownloadableChip
          key={documentId}
          downloadFunc={fileDownloadHandler}
          documentId={documentId}
          fileName={blockTitle}
          dataCy={dataCy}
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
