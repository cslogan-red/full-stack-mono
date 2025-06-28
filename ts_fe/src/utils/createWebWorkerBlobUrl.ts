import { type TransferableType } from '../hooks/useWorker';
import { workerJobRunner } from '.';
import { remoteDepsParser } from '.';

/**
 * Converts the "fn" function into the syntax needed to be executed within a web worker
 *
 * @param {Function} fn the function to run with web worker
 * @param {Array.<String>} deps array of strings, imported into the worker through "importScripts"
 *
 * @returns {String} a blob url, containing the code of "fn" as a string
 *
 * @example
 * createWebWorkerBlobUrl((a,b) => a+b, [])
 * returns: "onmessage=return Promise.resolve((a,b) => a + b)
 * .then(postMessage(['SUCCESS', result]))
 * .catch(postMessage(['ERROR', error])"
 */
export const createWebWorkerBlobUrl = (
  fn: Function,
  deps: string[],
  transferable: TransferableType,
) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#embedded_workers
  const blobCode = `
    ${remoteDepsParser(deps)};
    onmessage=(${workerJobRunner})({
      fn: (${fn}),
      transferable: '${transferable}'
    })
  `;
  const blob = new Blob([blobCode], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};
