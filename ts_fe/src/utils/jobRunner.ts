import { type TransferableType } from '../hooks/useWorker';

interface JOB_RUNNER_OPTIONS {
  fn: Function;
  transferable: TransferableType;
}

/**
 * wrapper accepts a user function (@fn) & returns an anonymous function
 * that executes with the user supplied params of the user function
 * but in the context of a web worker to do the work of the supplied user function
 * sending the results (whether SUCCESS or ERROR) back to the main thread via postMessage
 *
 * only meant to be used in web worker context due to reliance on postMessage
 */
export const workerJobRunner =
  (options: JOB_RUNNER_OPTIONS): Function =>
  async (e: MessageEvent) => {
    const [userFuncArgs] = e.data as [any[]];
    return Promise.resolve(options.fn(...userFuncArgs))
      .then((result) => {
        const isTransferable = (val: any) =>
          ('ArrayBuffer' in self && val instanceof ArrayBuffer) ||
          ('MessagePort' in self && val instanceof MessagePort) ||
          ('ImageBitmap' in self && val instanceof ImageBitmap) ||
          ('OffscreenCanvas' in self && val instanceof OffscreenCanvas);
        const transferList: any[] =
          options.transferable === 'auto' && isTransferable(result) ? [result] : [];
        // @ts-expect-error strong typing not realistic for the postMessage result
        postMessage(['SUCCESS', result], transferList);
      })
      .catch((error) => {
        postMessage(['ERROR', error]);
      });
  };
