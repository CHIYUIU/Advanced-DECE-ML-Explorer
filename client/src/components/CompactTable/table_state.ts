import {combineReducers} from 'redux';
import * as _ from "lodash";

// State

export enum RowStateType {
  COLLAPSED = 0,
  EXPANDED = 1
}

export interface CollapsedRows {
  startIndex: number;
  endIndex: number;
  state: RowStateType;
  cfLoaded?: boolean;
}

export interface ExpandedRow {
  index: number;  // The index in a possibly reordered DataFrame
  dataIndex: number; // The real index of the row in the dataFrame
  state: RowStateType.EXPANDED;
  cfLoaded?: boolean;
}

export function isExpandedRow(row: CollapsedRows | ExpandedRow): row is ExpandedRow {
  return row.state === RowStateType.EXPANDED;
}

export type RowState = CollapsedRows | ExpandedRow;

export function initRowStates (nRows: number): RowState[] {
  return breakCollapsedRows({startIndex: 0, endIndex: nRows, state: RowStateType.COLLAPSED});
}

// Actions

export enum ActionType {
  COLLAPSE_ROWS = 'COLLAPSE_ROWS',
  EXPAND_ROWS = 'EXPAND_ROWS',
  REORDER_ROWS = 'REORDER_ROWS',
  FILTER_ROWS = 'FILTER_ROWS',
  SORT = 'SORT',
  FILTER = 'FILTER',
  UPDATE_COLUMNS = 'UPDATE_COLUMNS',
}

export interface Action {
  type: ActionType;
}

export interface CollapseRows extends Action {
  startIndex: number;
  endIndex: number;
  type: ActionType.COLLAPSE_ROWS;
}

export interface ExpandRows extends Action {
  startIndex: number;
  endIndex: number;
  dataIndex: number[];
  type: ActionType.EXPAND_ROWS;
}

export interface ReorderRows extends Action {
  type: ActionType.REORDER_ROWS;
  index: number[];
}

export interface FilterRows extends Action {
  type: ActionType.FILTER_ROWS;
  index: number[];
}

// Reducers

// break collapsed rows so that we won't render too many rows in a cell
function breakCollapsedRows(row: CollapsedRows, maxStep: number = 200): CollapsedRows[] {
  const {startIndex, endIndex, state} = row;
  const n = Math.ceil((endIndex - startIndex) / maxStep);
  if (n === 1) return [row];
  const step = Math.ceil((endIndex - startIndex) / n);
  const rows: CollapsedRows[] = [];
  for (let i = 0; i < n; ++i) {
    const start = startInd