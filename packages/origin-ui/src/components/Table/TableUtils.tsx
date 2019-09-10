import { CSSProperties } from 'react';
import { ITableHeaderData } from './Table';
import { SortPropertiesType } from './PaginatedLoaderFilteredSorted';

const getKey = lbl => {
    const trimLabel = lbl
        .replace(/ \(.*\)/g, '')
        // eslint-disable-next-line no-useless-escape
        .replace(/\<.*\>/g, '')
        .replace(/'/g, '');
    const sp = trimLabel.split(' ').map(e => (e.indexOf('(') === -1 ? e.toLowerCase() : ''));

    return sp.join('_');
};

const generateHeader = (
    label,
    width?: string | number,
    right = false,
    body = false,
    sortProperties: SortPropertiesType = null
): ITableHeaderData => {
    const style: CSSProperties = {};

    if (right) {
        style.textAlign = 'right';
    }

    if (typeof width !== 'undefined') {
        if (typeof width === 'number') {
            style.width = `${width}px`;
        } else {
            style.width = width;
        }
    }

    return {
        label,
        key: getKey(label),
        style,
        styleBody: body ? { opacity: 1, fontWeight: 900 } : {},
        sortProperties
    };
};

const generateFooter = (label, body = false, hide = false) => {
    return {
        key: getKey(label),
        style: body ? { opacity: 1, color: 'white' } : null,
        hide
    };
};

const TableUtils = {
    getKey,
    generateHeader,
    generateFooter
};

export default TableUtils;
