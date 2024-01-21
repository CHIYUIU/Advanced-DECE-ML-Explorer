import axios, { AxiosResponse } from "axios";
import * as d3 from "d3";
import { DataFrame, DataMeta, Dataset, buildDataFrame } from "./data";
import { ROOT_URL, DEV_MODE } from "./env";

const API = `${ROOT_URL}/api`;

function checkRespons