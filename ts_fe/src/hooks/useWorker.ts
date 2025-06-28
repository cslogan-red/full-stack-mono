import { useRef, useCallback, useEffect, useState } from 'react';
import { useDeepEqualCallback } from '.';
import { WorkerAbortError } from '../utils';
import { createWebWorkerBlobUrl } from '../utils';

export const WORKER_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  RUNNING: 'RUNNING',
  ERROR: 'ERROR',
  TIMEOUT_EXPIRED: 'TIMEOUT_EXPIRED',
  KILLED: 'KILLED',
} as const;
type WorkerStatusType = (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];

type WorkerControllerType = {
  status: WorkerStatusType;
  kill: Function;
};

export const TRANSFERABLE = {
  AUTO: 'auto',
  NONE: 'none',
} as const;
export type TransferableType = (typeof TRANSFERABLE)[keyof typeof TRANSFERABLE];

type OptionsType = {
  timeout?: number;
  remoteDependencies?: string[];
  autoTerminate?: boolean;
  transferable?: TransferableType;
};

const PROMISE_RESOLVE = 'resolve';
const PROMISE_REJECT = 'reject';
const DEFAULT_OPTIONS: OptionsType = {
  timeout: undefined,
  remoteDependencies: [],
  autoTerminate: true,
  transferable: TRANSFERABLE.AUTO,
};

/**
 * useWorker hook is effectively a trampoline for handling chained callback executions
 * on a singluar web worker thread, based on the provided work through @fn & @options
 *
 * it handles lifecycle (run, kill) as well as orchestration of job statuses
 * sent back from the web worker thread(s), whose work is executed via supplied user
 * functions to jobRunner, which is converted to a worker Blob URL and executed here
 *
 * create multiple useWorker instances to run parallel threads
 *
 * @param {Function} fn the function to run with web worker
 * @param {Object} options useWorker option params
 */
export const useWorker = <T extends (...fnArgs: any[]) => any>(
  fn: T,
  options: OptionsType = DEFAULT_OPTIONS,
) => {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatusType>(WORKER_STATUS.PENDING);
  const worker = useRef<Worker & { _url?: string }>(undefined);
  const isRunning = useRef(false);
  const promise = useRef<{
    [PROMISE_REJECT]?: (result: ReturnType<T> | ErrorEvent | WorkerAbortError) => void;
    [PROMISE_RESOLVE]?: (result: ReturnType<T>) => void;
  }>({});
  const timeoutId = useRef<number>(0);

  const killWorker = useCallback(() => {
    if (worker.current?._url) {
      if (promise.current) {
        promise.current[PROMISE_REJECT]?.(new WorkerAbortError());
      }

      worker.current.terminate();
      URL.revokeObjectURL(worker.current._url);
      promise.current = {};
      worker.current = undefined;
      isRunning.current = false;
      window.clearTimeout(timeoutId.current);
    }
  }, []);

  const onWorkerEnd = useCallback(
    (status: WorkerStatusType) => {
      const terminate =
        options.autoTerminate != null ? options.autoTerminate : DEFAULT_OPTIONS.autoTerminate;

      if (terminate) {
        killWorker();
      }
      setWorkerStatus(status);
    },
    [options.autoTerminate, killWorker, setWorkerStatus],
  );

  const generateWorker = useDeepEqualCallback(() => {
    const {
      remoteDependencies = DEFAULT_OPTIONS.remoteDependencies,
      timeout = DEFAULT_OPTIONS.timeout,
      transferable = DEFAULT_OPTIONS.transferable,
    } = options;

    const blobUrl = createWebWorkerBlobUrl(fn, remoteDependencies!, transferable!);
    const newWorker: Worker & { _url?: string } = new Worker(blobUrl);
    newWorker._url = blobUrl;

    newWorker.onmessage = (e: MessageEvent) => {
      const [status, result] = e.data as [WorkerStatusType, ReturnType<T>];

      switch (status) {
        case WORKER_STATUS.SUCCESS:
          promise.current[PROMISE_RESOLVE]?.(result);
          onWorkerEnd(WORKER_STATUS.SUCCESS);
          break;
        default:
          promise.current[PROMISE_REJECT]?.(result);
          onWorkerEnd(WORKER_STATUS.ERROR);
          break;
      }
    };

    newWorker.onerror = (e: ErrorEvent) => {
      promise.current[PROMISE_REJECT]?.(e);
      onWorkerEnd(WORKER_STATUS.ERROR);
    };

    if (timeout) {
      timeoutId.current = window.setTimeout(() => {
        killWorker();
        setWorkerStatus(WORKER_STATUS.TIMEOUT_EXPIRED);
      }, timeout);
    }
    return newWorker;
  }, [fn, options, killWorker]);

  const callWorker = useCallback(
    (...workerArgs: Parameters<T>) => {
      const { transferable = DEFAULT_OPTIONS.transferable } = options;
      return new Promise<ReturnType<T>>((resolve, reject) => {
        promise.current = {
          [PROMISE_RESOLVE]: resolve,
          [PROMISE_REJECT]: reject,
        };
        const transferList: any[] =
          transferable === TRANSFERABLE.AUTO
            ? workerArgs.filter(
                (val: any) =>
                  ('ArrayBuffer' in window && val instanceof ArrayBuffer) ||
                  ('MessagePort' in window && val instanceof MessagePort) ||
                  ('ImageBitmap' in window && val instanceof ImageBitmap) ||
                  ('OffscreenCanvas' in window && val instanceof OffscreenCanvas),
              )
            : [];

        worker.current?.postMessage([[...workerArgs]], transferList);

        setWorkerStatus(WORKER_STATUS.RUNNING);
      });
    },
    [setWorkerStatus],
  );

  const workerHook = useCallback(
    (...fnArgs: Parameters<T>) => {
      const terminate =
        options.autoTerminate != null ? options.autoTerminate : DEFAULT_OPTIONS.autoTerminate;

      if (isRunning.current) {
        console.error(
          '[useWorker] parallel workers are not supported, create a separate instance of useWorker',
        );
        return Promise.reject();
      }
      if (terminate || !worker.current) {
        worker.current = generateWorker();
      }

      return callWorker(...fnArgs);
    },
    [options.autoTerminate, generateWorker, callWorker],
  );

  // handle task kill
  const killWorkerController = useCallback(() => {
    killWorker();
    setWorkerStatus(WORKER_STATUS.KILLED);
  }, [killWorker, setWorkerStatus]);

  const workerController = {
    status: workerStatus,
    kill: killWorkerController,
  };

  useEffect(() => {
    isRunning.current = workerStatus === WORKER_STATUS.RUNNING;
  }, [workerStatus]);

  useEffect(
    () => () => {
      killWorker();
    },
    [killWorker],
  );

  return [workerHook, workerController] as [typeof workerHook, WorkerControllerType];
};
