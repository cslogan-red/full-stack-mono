import { useState } from 'react';
import { useWorker } from '../../hooks';
import {
  getWorkerDataSet,
  getWorkerPartyDataSet,
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
  const [partyWorker, { status: partyWorkerStatus, kill: partyWorkerKill }] =
    useWorker(getWorkerPartyDataSet);
  const [workerResults, setWorkerResults] = useState<WorkerDataResponseType | undefined>(undefined);
  const [longWorkerResults, setLongWorkerResults] = useState<WorkerDataResponseType | undefined>(
    undefined,
  );
  const [partyWorkerResults, setPartyWorkerResults] = useState<WorkerDataResponseType | undefined>(
    undefined,
  );
  const [isMultiThreaded, setIsMultiThreaded] = useState<boolean>(true);
  const [smallBatchSize, setSmallBatchSize] = useState<number>(BATCH_SIZE.small);
  const [largeBatchSize, setLargeBatchSize] = useState<number>(BATCH_SIZE.large);
  const [partyViewBox, setPartyViewBox] = useState<LatLongResponseType>({
    lat: EXT_START_LAT,
    lng: EXT_START_LNG,
  });
  const [isPartyMode, setPartyMode] = useState<boolean>(false);
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
  // party handler!
  const partyWorkloadHandler = async () => {
    const isMT = isMultiThreaded;
    const result = isMT
      ? await partyWorker({ startLat: partyViewBox.lat, startLng: partyViewBox.lng })
      : await getWorkerPartyDataSet({ startLat: partyViewBox.lat, startLng: partyViewBox.lng });
    if (result.nextToken.lat > 0) {
      let pageNum = 1;
      // handle paginated results multi or single threaded
      setPartyWorkerResults({ ...result });
      setPartyMode(!isPartyMode);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        paginatedResult = isMT
          ? await partyWorker({ startLat: partyViewBox.lat, startLng: partyViewBox.lng, pageNum })
          : await getWorkerPartyDataSet({
              startLat: partyViewBox.lat,
              startLng: partyViewBox.lng,
              pageNum,
            });
        setPartyWorkerResults({ ...partyWorkerResults, ...paginatedResult });
        pageNum++;
      }
    } else {
      setPartyWorkerResults({ ...result });
      setPartyMode(!isPartyMode);
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
  const partyWorkerHandler = {
    status: partyWorkerStatus,
    kill: partyWorkerKill,
    clickHandler: partyWorkloadHandler,
  };
  const smallItemCountHandler = (size: number) => setSmallBatchSize(size);
  const largeItemCountHandler = (size: number) => setLargeBatchSize(size);
  const boundingBoxHandler = (latlng: LatLongResponseType) => {
    setPartyViewBox({ ...latlng });
  };

  return (
    <div className={'app-container'} aria-label={'app-container'}>
      <div className={'app-container--sidenav'}>
        <SideNav
          multiThreadedCheckedHandler={multiThreadedCheckedHandler}
          smallWorkerHandler={smallWorkerHandler}
          largeWorkerHandler={largeWorkerHandler}
          partyWorkerHandler={partyWorkerHandler}
          smallWorkerResults={workerResults?.results?.length}
          largeWorkerResults={longWorkerResults?.results?.length}
          smallItemCountHandler={smallItemCountHandler}
          largeItemCountHandler={largeItemCountHandler}
        />
      </div>
      <div className={'app-container--content'}>
        <div className={'app-container--content-body'} aria-label={'app-container-map'}>
          <MapBox
            startLat={EXT_START_LAT}
            startLng={EXT_START_LNG}
            boundingBoxHandler={boundingBoxHandler}
            latLngMarkerCoords={workerResults?.results}
            longLatLngMarkerCoords={longWorkerResults?.results}
            partyLatLngMarkerCoords={partyWorkerResults?.results}
            isPartyMode={isPartyMode}
          />
        </div>
      </div>
    </div>
  );
};
export default AppContainer;
