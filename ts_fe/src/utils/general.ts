export const WORKER_SIZE = {
  small: 'small',
  large: 'large',
} as const;

export type WorkerSizeType = (typeof WORKER_SIZE)[keyof typeof WORKER_SIZE];

export const BATCH_SIZE = {
  small: 100,
  smallMax: 500,
  large: 10000,
  largeMax: 50000,
};

// map start point (SF bay)
export const EXT_START_LNG = -122.41;
export const EXT_START_LAT = 37.75;
export const EXT_VBOX_START_LNG = -122.34202556272197;
export const EXT_VBOX_START_LAT = 37.76948060605258;
