import { useState } from 'react';
import { useWorker } from '../../hooks';
import {
  getWorkerDataSet,
  getWorkerPartyDataSet,
  type WorkerDataResponseType,
  type LatLongResponseType,
} from '../../services/appDataService';
import { EXT_START_LAT, EXT_START_LNG, BATCH_SIZE } from '../../utils/general';
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
  const [viewBox, setViewBox] = useState<LatLongResponseType>({
    lat: EXT_START_LAT,
    lng: EXT_START_LNG,
  });
  const [isPartyMode, setPartyMode] = useState<boolean>(false);
  const getSmBS = () => (smallBatchSize > BATCH_SIZE.smallMax ? BATCH_SIZE.small : smallBatchSize);
  const getLgBS = () => (largeBatchSize > BATCH_SIZE.largeMax ? BATCH_SIZE.large : largeBatchSize);

  // primary middleware orchestrators, since lacking a true middlware store for this demo
  const smallWorkloadHandler = async () => {
    const isMT = isMultiThreaded;
    const result = isMT
      ? await smallWorker({
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getSmBS(),
          isSmall: true,
        })
      : await getWorkerDataSet({
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getSmBS(),
          isSmall: true,
        });
    if (result.nextToken.lat > 0) {
      let pageNum = 1;
      // handle paginated results multi or single threaded
      setWorkerResults(result);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        const startLat = paginatedResult.nextToken.lat;
        const startLng = paginatedResult.nextToken.lng;
        paginatedResult = isMT
          ? await smallWorker({ startLat, startLng, batchSize: getSmBS(), isSmall: true, pageNum })
          : await getWorkerDataSet({
              startLat,
              startLng,
              batchSize: getSmBS(),
              isSmall: true,
              pageNum,
            });
        setWorkerResults({ ...paginatedResult });
        pageNum++;
      }
    } else {
      setWorkerResults({ ...result });
    }
  };
  const largeWorkloadHandler = async () => {
    const isMT = isMultiThreaded;
    const result = isMT
      ? await largeWorker({ startLat: viewBox.lat, startLng: viewBox.lng, batchSize: getLgBS() })
      : await getWorkerDataSet({
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getLgBS(),
        });
    if (result.nextToken.lat > 0) {
      // handle paginated results multi or single threaded
      setLongWorkerResults(result);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        let pageNum = 1;
        const startLat = paginatedResult.nextToken.lat;
        const startLng = paginatedResult.nextToken.lng;
        paginatedResult = isMT
          ? await largeWorker({ startLat, startLng, batchSize: getLgBS(), pageNum })
          : await getWorkerDataSet({ startLat, startLng, batchSize: getLgBS(), pageNum });
        setLongWorkerResults({ ...paginatedResult });
        pageNum++;
      }
    } else {
      setLongWorkerResults({ ...result });
    }
  };
  // party handler!
  const partyWorkloadHandler = async () => {
    const isMT = isMultiThreaded;
    const result = isMT
      ? await partyWorker({ startLat: viewBox.lat, startLng: viewBox.lng })
      : await getWorkerPartyDataSet({ startLat: viewBox.lat, startLng: viewBox.lng });
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
          ? await partyWorker({ startLat: viewBox.lat, startLng: viewBox.lng, pageNum })
          : await getWorkerPartyDataSet({
              startLat: viewBox.lat,
              startLng: viewBox.lng,
              pageNum,
            });
        setPartyWorkerResults({ ...partyWorkerResults, ...paginatedResult });
        pageNum++;
      }
    } else {
      setPartyWorkerResults({ ...partyWorkerResults, ...result });
      setPartyMode(!isPartyMode);
    }
  };

  // nav handlers
  const multiThreadedCheckedHandler = () => setIsMultiThreaded(!isMultiThreaded);
  const smallWorkerHandler = {
    status: smallWorkerStatus,
    kill: smallWorkerKill,
    clickHandler: smallWorkloadHandler,
  };
  const largeWorkerHandler = {
    status: largeWorkerStatus,
    kill: largeWorkerKill,
    clickHandler: largeWorkloadHandler,
  };
  const partyWorkerHandler = {
    status: partyWorkerStatus,
    kill: partyWorkerKill,
    clickHandler: partyWorkloadHandler,
  };
  const smallItemCountHandler = (size: number) => setSmallBatchSize(size);
  const largeItemCountHandler = (size: number) => setLargeBatchSize(size);
  const boundingBoxHandler = (latlng: LatLongResponseType) => {
    setViewBox({ ...latlng });
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
