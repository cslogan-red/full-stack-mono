import { useState } from 'react';
import { useWorker } from '../../hooks';
import {
  getWorkerDataSet,
  type WorkerDataResponseType,
  type LatLongResponseType,
} from '../../services/appDataService';
import {
  WORKER_SIZE,
  EXT_START_LAT,
  EXT_START_LNG,
  BATCH_SIZE,
  type WorkerSizeType,
} from '../../utils/general';
// components
import SideNav from '../SideNav/SideNav';
import MapBox from '../MapBox/MapBox';
// styles
import './AppContainer.scss';

const AppContainer = () => {
  const [smallWorker, { status: smallWorkerStatus, kill: smallWorkerKill }] =
    useWorker(getWorkerDataSet);
  const [largeWorker, { status: largeWorkerStatus, kill: largeWorkerKill }] =
    useWorker(getWorkerDataSet);
  const [workerResults, setWorkerResults] = useState<WorkerDataResponseType | undefined>(undefined);
  const [longWorkerResults, setLongWorkerResults] = useState<WorkerDataResponseType | undefined>(
    undefined,
  );
  const [isMultiThreaded, setIsMultiThreaded] = useState<boolean>(true);
  const [smallBatchSize, setSmallBatchSize] = useState<number>(BATCH_SIZE.small);
  const [largeBatchSize, setLargeBatchSize] = useState<number>(BATCH_SIZE.large);
  const getSmBS = () => (smallBatchSize > BATCH_SIZE.smallMax ? BATCH_SIZE.small : smallBatchSize);
  const getLgBS = () => (largeBatchSize > BATCH_SIZE.largeMax ? BATCH_SIZE.large : largeBatchSize);

  // primary middleware orchestrator
  const workloadHandler = async (size: WorkerSizeType = WORKER_SIZE.small) => {
    const isSmallMT = isMultiThreaded && size === WORKER_SIZE.small;
    const isLargeMT = isMultiThreaded && size === WORKER_SIZE.large;
    const isSmall = size === WORKER_SIZE.small;
    const isSmallWorker = isSmallMT || isSmall;
    const isLargeWorker = !isSmallWorker;

    const result = isSmallMT
      ? await smallWorker({ batchSize: getSmBS(), isSmall: true })
      : isLargeMT
        ? await largeWorker({ batchSize: getLgBS() })
        : isSmall
          ? await getWorkerDataSet({ batchSize: getSmBS(), isSmall: true })
          : await getWorkerDataSet({ batchSize: getLgBS() });
    if (result.nextToken.lat > 0) {
      // handle paginated results multi or single threaded
      if (isSmallWorker) setWorkerResults(result);
      if (isLargeWorker) setLongWorkerResults(result);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        const startLat = paginatedResult.nextToken.lat;
        const startLng = paginatedResult.nextToken.lng;
        paginatedResult = isSmallMT
          ? await smallWorker({ startLat, startLng, batchSize: getSmBS(), isSmall: true })
          : isLargeMT
            ? await largeWorker({ startLat, startLng, batchSize: getLgBS() })
            : isSmall
              ? await getWorkerDataSet({ startLat, startLng, batchSize: getSmBS(), isSmall: true })
              : await getWorkerDataSet({ startLat, startLng, batchSize: getLgBS() });
        if (isSmallWorker) setWorkerResults({ ...paginatedResult });
        if (isLargeWorker) setLongWorkerResults({ ...paginatedResult });
      }
    } else {
      if (isSmallWorker) setWorkerResults({ ...result });
      if (isLargeWorker) setLongWorkerResults({ ...result });
    }
  };
  // nav handlers
  const multiThreadedCheckedHandler = () => setIsMultiThreaded(!isMultiThreaded);
  const smallWorkerHandler = {
    status: smallWorkerStatus,
    kill: smallWorkerKill,
    clickHandler: workloadHandler,
  };
  const largeWorkerHandler = {
    status: largeWorkerStatus,
    kill: largeWorkerKill,
    clickHandler: workloadHandler,
  };
  const smallItemCountHandler = (size: number) => setSmallBatchSize(size);
  const largeItemCountHandler = (size: number) => setLargeBatchSize(size);

  return (
    <div className={'app-container'} aria-label={'app-container'}>
      <div className={'app-container--sidenav'}>
        <SideNav
          multiThreadedCheckedHandler={multiThreadedCheckedHandler}
          smallWorkerHandler={smallWorkerHandler}
          largeWorkerHandler={largeWorkerHandler}
          smallWorkerResults={workerResults?.results?.length}
          largeWorkerResults={longWorkerResults?.results?.length}
          smallItemCountHandler={smallItemCountHandler}
          largeItemCountHandler={largeItemCountHandler}
        />
      </div>
      <div className={'app-container--content'}>
        <div className={'app-container--content-body'}>
          <MapBox
            startLat={EXT_START_LAT}
            startLng={EXT_START_LNG}
            latLngMarkerCoords={workerResults?.results}
            longLatLngMarkerCoords={longWorkerResults?.results}
          />
        </div>
      </div>
    </div>
  );
};
export default AppContainer;
