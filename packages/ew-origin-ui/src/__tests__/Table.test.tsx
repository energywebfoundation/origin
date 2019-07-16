import * as React from "react";
import { mount } from "enzyme";
import { Table } from "../elements/Table/Table";
import TableUtils from "../elements/utils/TableUtils";
import { dataTestSelector } from "../utils/Helper";

const wait = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

it('correctly renders Table component', async () => {
    const PAGE_SIZE = 3;
    const HEADER_DEFINITION = [
        `Header1`,
        `Header2`
    ];

    const generateData = (columnsAmount: number, rowsAmount: number): string[][] => {
        let dataDefinition = [];

        for (let i = 0; i < rowsAmount; i++) {
            const columnsDefinition = [];
            for (let j = 0; j < columnsAmount; j++) {
                columnsDefinition.push(`Row${i + 1}_Column${j + 1}`);
            }

            dataDefinition.push(columnsDefinition);
        }

        return dataDefinition;
    }

    const data = generateData(HEADER_DEFINITION.length, 11);
    const DEFAULT_WIDTH = 50;
    
    const SELECTORS = {
        CURRENT_PAGINATION_ENTRY: '.Pagination_list_entry-current',
        ROW: 'tbody tr'
    }
    const rowStyle = `style="width: ${DEFAULT_WIDTH}px;"`;
    const thHTML = (text) => `<th ${rowStyle}><div>${text}</div></th>`;
    const trHTML = (...columns) => `<tr>${
        columns.map(col => `<td ${rowStyle} class=""><div>${col}</div></td>`).join('')
    }</tr>`;

    let paginatedData;

    const generateHeader = (label, width = DEFAULT_WIDTH, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);

    const header = HEADER_DEFINITION.map((text) => generateHeader(text));

    const total = data.length;

    let loadPage, rows;

    const renderedTable = mount(
        <Table
            header={header}
            data={paginatedData}
            loadPage={loadPage}
            total={total}
            pageSize={PAGE_SIZE}
        />
    )

    loadPage = (page) => {
        const offset = (page - 1) * PAGE_SIZE;
    
        paginatedData = data.slice(offset, offset + PAGE_SIZE);

        renderedTable.setProps({
            data: paginatedData
        });
    }

    renderedTable.setProps({
        loadPage
    })

    loadPage(1);

    const thElements = renderedTable.find('thead tr th');

    expect(thElements.length).toEqual(header.length);

    thElements.map((element, index) => {
        expect(element.html()).toBe(thHTML(HEADER_DEFINITION[index]));
    });

    function assertRowsCorrectness() {
        rows = renderedTable.find(SELECTORS.ROW);

        expect(rows.length).toBe(paginatedData.length);

        rows.map((element, index) => {
            expect(element.html()).toBe(trHTML(...paginatedData[index]));
        });
    }

    assertRowsCorrectness();

    const pagination = renderedTable.find('.Pagination');
    const paginationElements = pagination.find('ul li');

    expect(pagination.find(dataTestSelector('pagination-helper-text')).text()).toBe(`Showing 1 to ${PAGE_SIZE} of ${total} entries`);

    expect(paginationElements.find(SELECTORS.CURRENT_PAGINATION_ENTRY).text()).toBe('1');

    renderedTable.find('a[aria-label="Page 2"]').simulate('click');
    await wait(0);    
    expect(paginationElements.map(el => el.text())).toEqual([
        "Previous",
        "1",
        "2",
        "3",
        "4",
        "Next"
    ]);

    expect(renderedTable.find(SELECTORS.CURRENT_PAGINATION_ENTRY).text()).toBe('2');

    expect(pagination.find(dataTestSelector('pagination-helper-text')).text()).toBe(`Showing ${1 + PAGE_SIZE} to ${2*PAGE_SIZE} of ${total} entries`);

    assertRowsCorrectness();

    renderedTable.find('a[aria-label="Page 3"]').simulate('click');

    await wait(0);

    expect(pagination.find(dataTestSelector('pagination-helper-text')).text()).toBe(`Showing ${1 + 2 * PAGE_SIZE} to ${3*PAGE_SIZE} of ${total} entries`);

    expect(renderedTable.find(SELECTORS.CURRENT_PAGINATION_ENTRY).text()).toBe('3');

    assertRowsCorrectness();

    renderedTable.find('a[aria-label="Page 4"]').simulate('click');

    await wait(0);

    expect(pagination.find(dataTestSelector('pagination-helper-text')).text()).toBe(`Showing ${1 + 3 * PAGE_SIZE} to ${total} of ${total} entries`);

    assertRowsCorrectness();

    expect(renderedTable.find(SELECTORS.CURRENT_PAGINATION_ENTRY).text()).toBe('4');
});