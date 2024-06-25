import { Request, Response } from 'express';
enum Color {
  NULL = '',
  RED = '\x1b[31m',
  GREEN = '\x1b[32m',
  YELLOW = '\x1b[33m',
  PURPLE = '\x1b[35m',
}
const RESET = '\x1b[0m';
const REQUEST_COLOR = '\x1b[32m';

const methods = new Map([
  ['GET', Color.GREEN],
  ['POST', Color.YELLOW],
  ['PUT', Color.PURPLE],
  ['DELETE', Color.RED],
]);

const codes = new Map([
  [200, Color.GREEN],
  [201, Color.GREEN],
  [204, Color.GREEN],
  [301, Color.PURPLE],
  [302, Color.PURPLE],
  [304, Color.PURPLE],
  [400, Color.YELLOW],
  [401, Color.YELLOW],
  [403, Color.YELLOW],
  [404, Color.YELLOW],
  [422, Color.YELLOW],
  [500, Color.RED],
  [502, Color.RED],
  [503, Color.RED],
  [504, Color.RED],
]);

export interface TransformFunction {
  (request: Request, response: Response): string;
}

export type TypeFormat = 'request' | 'response';

const color = (color: Color, str: any): string => color + str + RESET;
const formatMethod = ({ method }: Request): string => color(methods.get(method), method);
const formatVersion = ({ httpVersion }: Request): string => httpVersion;
const formatUrl = ({ originalUrl }: Request): string => color(Color.NULL, originalUrl);
const formatIp = ({ ip }: Request): string => color(Color.NULL, ip);
const formatStatus = (_: Request, { statusCode: code }: Response): string => color(codes.get(code), code);

const tokens = new Map<string, TransformFunction>([
  [':method', formatMethod],
  [':version', formatVersion],
  [':url', formatUrl],
  [':ip', formatIp],
  [':status', formatStatus],
]);

const REQUEST_FORMAT = 'Requested :method :version :url from :ip';
const RESPONSE_FORMAT = 'Responded to :url requested by :ip with status :status';

const formats = new Map<string, string>([
  ['request', REQUEST_FORMAT],
  ['response', RESPONSE_FORMAT],
]);
const selectedFormats = {
  request: 'request',
  response: 'response',
};

export const addToken = (token: string, format: (request: Request, response: Response) => string): void => {
  tokens.set(token, format);
};

export const addCustomFormat = (name: string, format: string): void => {
  if (formats.has(name)) throw new Error(`Format ${name} already exists`);
  formats.set(name, format);
};

export const setRequestFormat = (name: string): void => {
  if (!formats.has(name)) throw new Error(`Format ${name} does not exist`);
  selectedFormats.request = name;
};

export const setResponseFormat = (name: string): void => {
  if (!formats.has(name)) throw new Error(`Format ${name} does not exist`);
  selectedFormats.response = name;
};

export const use = (name: string, format: string, type: TypeFormat): void => {
  if (!formats.has(name)) formats.set(name, format);
  selectedFormats[type] = name;
};

export const formatLog = (message: string, request: Request, response: Response): string => {
  let log = message;
  tokens.forEach((format, token) => {
    if (!log.includes(token)) return;
    log = log.replace(token, format(request, response));
  });
  const timestamp = new Date().toISOString();
  return `${REQUEST_COLOR} ${timestamp}${RESET} ${log}`;
};

export const logRequest = (request: Request): void => {
  const log = formatLog(formats.get(selectedFormats.request), request, null);
  console.log(log);
};
export const logResponse = (request: Request, response: Response): void => {
  const log = formatLog(formats.get(selectedFormats.response), request, response);
  console.log(log);
};
