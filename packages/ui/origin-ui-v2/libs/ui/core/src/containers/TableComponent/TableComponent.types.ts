export type TableHeaderData = Record<string, string>;

export type TableActionData = {
  name: string;
  icon: React.ReactNode;
  onClick: (rowId: string | number) => any;
};

export type TableRowData = {
  id: number | string;
  actions?: TableActionData[];
  [key: string]: any;
};
