export const WORKER_SIZE = {
  small: 'small',
  large: 'large',
} as const;

export type WorkerSizeType = (typeof WORKER_SIZE)[keyof typeof WORKER_SIZE];

export const BATCH_SIZE = {
  small: 100,
  large: 20000,
};

// map start point (SF bay)
export const EXT_START_LNG = -122.4;
export const EXT_START_LAT = 37.78;
