import React from 'react';
import { useSelector } from 'react-redux';
import { FileClient } from '@energyweb/origin-backend-client';
import { makeStyles, createStyles, useTheme, Chip } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import { useOriginConfiguration } from '../../utils/configuration';
import { LightenColor } from '../../utils';

import { getBackendClient } from '../../features/general/selectors';

export const downloadFile = async (client: FileClient, id: string, name: string) => {
    if (!client) {
        return;
    }

    try {
        const response = await client.download(id);
        if (response) {
            const imageType = response.headers['content-type'];
            const blob = new Blob([Buffer.from((response.data.data as unknown) as string)], {
                type: imageType
            });
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

interface IProps {
    documents: string[];
    name: string;
}

export const Download = (props: IProps) => {
    const { documents, name } = props;
    const fileClient: FileClient = useSelector(getBackendClient)?.fileClient;
    const configuration = useOriginConfiguration();
    const originTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;

    const bgColorLight = LightenColor(originTextColor, 25);

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
                border: `1px solid ${bgColorLight}`,
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
        return (
            <Chip
                label={`${documents.length > 1 ? `${name} ${index + 1}` : `${name}`}`}
                variant="outlined"
                color="primary"
                onClick={() => downloadFile(fileClient, documentId, name)}
                icon={<GetApp color="primary" />}
                style={{ background: bgColorLight }}
                key={index}
                {...props}
            />
        );
    });

    return <aside className={classes.thumbsContainer}>{thumbs}</aside>;
};
