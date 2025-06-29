type WorkerPropsType = {
  startLat?: number;
  startLng?: number;
  pageNum?: number;
  batchSize?: number;
  isSmall?: boolean;
};
export type LatLongResponseType = {
  lat: number;
  lng: number;
};
export type WorkerDataResponseType = {
  results: LatLongResponseType[];
  nextToken: LatLongResponseType;
};

/**
 * Fetch an actual large data set from local node server, simulate complex CPU work on data
 * In single-threaded (UI thread) mode this will result in UI chug and stuttering, while
 * mulit-threaded requests pushed to Workers through useWorker hook continue to process separately
 * passing data back to the main thread in pages as it becomes available for a smooth UI experience
 * @param props @WorkerPropsType
 * @returns @WorkerDataResponseType
 */
export const getWorkerDataSet = async (props: WorkerPropsType): Promise<WorkerDataResponseType> => {
  const { startLat, startLng, batchSize = 25, isSmall } = props;
  let returnVal = { results: [], nextToken: { lat: 0, lng: 0 } };
  try {
    const endStr = startLat && startLng ? `&startLat=${startLat}&startLng=${startLng}` : '';
    const result = await fetch(
      `http://localhost:5173/local/api/v1/latlng?batchSize=${batchSize}&isSmall=${isSmall ?? false}${endStr}`,
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
 * Fetch an actual large data set from local node server, simulate complex CPU work on data
 * In single-threaded (UI thread) mode this will result in UI chug and stuttering, while
 * mulit-threaded requests pushed to Workers through useWorker hook continue to process separately
 * passing data back to the main thread in pages as it becomes available for a smooth UI experience
 * @param props @WorkerPropsType
 * @returns @WorkerDataResponseType
 */
export const getWorkerPartyDataSet = async (
  props: WorkerPropsType,
): Promise<WorkerDataResponseType> => {
  const { startLat, startLng, pageNum } = props;
  let returnVal = { results: [], nextToken: { lat: 0, lng: 0 } };
  try {
    const endStr = startLat && startLng ? `&startLat=${startLat}&startLng=${startLng}` : '';
    const pageNumStr = pageNum ? `&pageNum=${pageNum}` : '';
    const result = await fetch(`http://localhost:5173/local/api/v1/latlng/party?${endStr}${pageNumStr}`);
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
  const { startLat, startLng, batchSize = 25, isSmall } = props;
  const START_LNG = isSmall ? -122.4 : -122.3;
  const START_LAT = isSmall ? 37.8 : 37.7;
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
      // if the batch size is greater than PAGE_SIZE, handle pagination by searching
      // for window within complete list of options
      if (startLat && startLng) {
        // n+1 pagination
        const sI = acc.findIndex((val) => `${val.lat}` === `${startLat}`);
        const pageAcc: LatLongResponseType[] = [];
        for (let i = sI + 1; i < sI + 1 + PAGE_SIZE; i++) {
          if (acc[i]) {
            pageAcc.push(acc[i]);
          }
        }
        console.log(startLat, sI, pageAcc, batchSize);
        if (pageAcc.length === PAGE_SIZE && sI * 2 !== batchSize - 2) {
          returnVal.nextToken = pageAcc[pageAcc.length - 1];
          returnVal.results = [...pageAcc];
        } else {
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
