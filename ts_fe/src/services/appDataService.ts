type WorkerPropsType = {
  url: string;
  startLat?: number;
  startLng?: number;
  pageNum?: number;
  batchSize?: number;
  isSmall?: boolean;
};
export type LatLongResponseType = {
  lat: number;
  lng: number;
  infoText?: string;
};
export type WorkerDataResponseType = {
  results: LatLongResponseType[];
  nextToken: LatLongResponseType;
};

export const BASE_URL = 'http://localhost:5173/local/api/v1/latlng';

/**
 * Fetch an actual large data set from local node server, simulate complex CPU work on data
 * In single-threaded (UI thread) mode this will result in UI chug and stuttering, while
 * mulit-threaded requests pushed to Workers through useWorker hook continue to process separately
 * passing data back to the main thread in pages as it becomes available for a smooth UI experience
 * @param props @WorkerPropsType
 * @returns @WorkerDataResponseType
 */
export const getNonBlockingDataSet = async (
  props: WorkerPropsType,
): Promise<WorkerDataResponseType> => {
  const { url, startLat, startLng, batchSize = 25, isSmall, pageNum } = props;
  let returnVal = { results: [] as LatLongResponseType[], nextToken: { lat: 0, lng: 0 } };
  try {
    const endStr = startLat && startLng ? `&startLat=${startLat}&startLng=${startLng}` : '';
    const pageNumStr = pageNum ? `&pageNum=${pageNum}` : '';
    const result = await fetch(
      `${url}?batchSize=${batchSize}&isSmall=${isSmall ?? false}${endStr}${pageNumStr}`,
    );
    const resultJson = await result.json();
    //
    const mappedResponse = {
      ...resultJson.returnVal,
      results: resultJson.returnVal?.results?.map((val: LatLongResponseType) => ({
        ...val,
        infoText: 'Web worker optimization complete, location fully loaded.',
      })),
    };
    returnVal = mappedResponse;

    // simulate compute intensive workload on every data hyrdation request
    const numbers = [...Array(9000000)].map(() => ~~(Math.random() * 1000000));
    const sortNumbers = (nums: number[]) => nums.sort();
    sortNumbers(numbers);
  } catch (ex) {
    console.error(`Exception in appDataService.getWorkerDataSet::${ex}`);
  }
  return returnVal;
};

/**
 * Fetch an actual large BLOCKING data set from local node server, simulate complex CPU work on data
 * In single-threaded (UI thread) mode this will result in UI chug and stuttering, while
 * mulit-threaded requests pushed to Workers through useWorker hook continue to process separately
 * passing data back to the main thread in pages as it becomes available for a smooth UI experience
 * @param props @WorkerPropsType
 * @returns @WorkerDataResponseType
 */
export const getBlockingDataSet = async (
  props: WorkerPropsType,
): Promise<WorkerDataResponseType> => {
  const { url, startLat, startLng, batchSize = 25, isSmall, pageNum } = props;
  let returnVal = { results: [], nextToken: { lat: 0, lng: 0 } };
  try {
    const endStr = startLat && startLng ? `&startLat=${startLat}&startLng=${startLng}` : '';
    const pageNumStr = pageNum ? `&pageNum=${pageNum}` : '';
    const result = await fetch(
      `${url}?batchSize=${batchSize}&isSmall=${isSmall ?? false}${endStr}${pageNumStr}`,
    );
    const resultJson = await result.json();
    returnVal = resultJson.returnVal;

    // simulate compute intensive workload on every data hyrdation request
    const numbers = [...Array(9000000)].map(() => ~~(Math.random() * 1000000));
    const sortNumbers = (nums: number[]) => nums.sort();
    sortNumbers(numbers);
  } catch (ex) {
    console.error(`Exception in appDataService.getWorkerDataSet::${ex}`);
  }
  return returnVal;
};

/**
 * Simulate fetching a large dataset locally for quick testing of algorithm changes
 * @param props @WorkerPropsType
 * @returns @WorkerDataResponseType
 */
export const localWorkerDataSet = async (
  props: WorkerPropsType,
): Promise<WorkerDataResponseType> => {
  const { startLat, startLng, batchSize = 25, isSmall, pageNum } = props;
  const START_LNG = isSmall ? Number(`${startLng}`) - 0.1 : Number(`${startLng}`);
  const START_LAT = isSmall ? Number(`${startLat}`) - 0.1 : Number(`${startLat}`);
  const PAGE_SIZE = 25;
  const acc: LatLongResponseType[] = [];
  const returnVal = {
    results: acc,
    nextToken: { lat: 0, lng: 0 },
  };

  return new Promise<WorkerDataResponseType>((resolve) => {
    return setTimeout(() => {
      // calculate the entire possible list based on the input batch size
      const ARC_DEGREE_SEP = isSmall ? 0.000015 : 0.00001;
      for (let i = 0; i < batchSize; i++) {
        const currentResult = { lat: 0, lng: 0 };
        const latSep =
          acc.length === 0 ? START_LAT * ARC_DEGREE_SEP : acc[i - 1].lat * ARC_DEGREE_SEP;
        const lngSep =
          acc.length === 0 ? START_LNG * ARC_DEGREE_SEP : acc[i - 1].lng * ARC_DEGREE_SEP;

        currentResult.lat =
          acc.length === 0 ? START_LAT - latSep : acc[i - 1].lat + latSep - (isSmall ? 0.0025 : 0);
        currentResult.lng =
          acc.length === 0 ? START_LNG - lngSep : acc[i - 1].lng + lngSep - (isSmall ? 0.0025 : 0);
        acc.push(currentResult);
      }
      // paginate based on PAGE_SIZE
      if (pageNum) {
        // n+1 pagination
        const sI = pageNum * PAGE_SIZE;
        const pageAcc: LatLongResponseType[] = [...acc.slice(sI, sI + PAGE_SIZE)];
        if (sI + PAGE_SIZE >= acc.length) {
          returnVal.nextToken = { lat: 0, lng: 0 };
          returnVal.results = [...pageAcc];
        } else {
          returnVal.nextToken = pageAcc[pageAcc.length - 1];
          returnVal.results = [...pageAcc];
        }
      } else {
        // first page, possible pagination
        if (acc.length <= PAGE_SIZE) {
          returnVal.results = [...acc];
        } else {
          returnVal.results = [...acc.slice(0, PAGE_SIZE)];
          returnVal.nextToken = acc[PAGE_SIZE - 1];
        }
      }
      resolve(returnVal);
    }, 1000); // Simulating network delay
  });
};
