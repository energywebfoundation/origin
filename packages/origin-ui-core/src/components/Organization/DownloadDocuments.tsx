import React from 'react';
import { useSelector } from 'react-redux';
import { getOffChainDataSource } from '../../features/general/selectors';
import { makeStyles, createStyles, useTheme, Chip } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';

export const DownloadDocuments = ({ documents, name }) => {
    const offChainDataSource = useSelector(getOffChainDataSource);
    const filesClient = offChainDataSource?.filesClient;

    const useStyles = makeStyles(() =>
        createStyles({
            thumbsContainer: {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 16,
                marginBottom: 16
            },
            thumb: {
                display: 'inline-flex',
                borderRadius: 2,
                border: '1px solid #eaeaea',
                marginBottom: 8,
                marginRight: 8,
                width: 100,
                height: 100,
                padding: 4,
                boxSizing: 'border-box'
            },
            thumbInner: {
                display: 'flex',
                minWidth: 0,
                overflow: 'hidden'
            }
        })
    );
    const classes = useStyles(useTheme());

    const thumbs = documents.map((documentId, index) => {
        const downloadFile = async (id) => {
            try {
                const response = await filesClient.download(id);
                if (response) {
                    console.log(response);
                    const imageType = response.headers['content-type'];
                    const blob = new Blob([response.data], { type: imageType });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', name);
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 100);
                }
            } catch (error) {
                console.log(error);
            }
        };

        return (
            <Chip
                label={`${documents.length > 1 ? `${name} ${index + 1}` : `${name}`}`}
                variant="outlined"
                color="primary"
                onClick={() => downloadFile(documentId)}
                icon={<GetApp color="primary" />}
                style={{ background: '#e0e0e0' }}
                key={index}
            />
        );
    });

    return <aside className={classes.thumbsContainer}>{thumbs}</aside>;
};
