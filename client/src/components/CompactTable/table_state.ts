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

export function isExpandedRow(row: CollapsedRows | ExpandedRow): row is ExpandedRow 