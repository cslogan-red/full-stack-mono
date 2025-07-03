import { useState } from 'react';
import { useWorker } from '../../hooks';
import {
  getNonBlockingDataSet,
  getBlockingDataSet,
  type WorkerDataResponseType,
  type LatLongResponseType,
  BASE_URL,
} from '../../services/appDataService';
import {
  EXT_START_LAT,
  EXT_START_LNG,
  EXT_VBOX_START_LNG,
  EXT_VBOX_START_LAT,
  BATCH_SIZE,
} from '../../utils/general';
// components
import SideNav from '../SideNav/SideNav';
import MapBox from '../MapBox/MapBox';
// styles
import './AppContainer.scss';

const AppContainer = () => {
  const [smallWorker, { status: smallWorkerStatus, kill: smallWorkerKill }] =
    useWorker(getNonBlockingDataSet);
  const [largeWorker, { status: largeWorkerStatus, kill: largeWorkerKill }] =
    useWorker(getNonBlockingDataSet);
  const [partyWorker, { status: partyWorkerStatus, kill: partyWorkerKill }] =
    useWorker(getNonBlockingDataSet);
  const [workerResults, setWorkerResults] = useState<LatLongResponseType[]>([]);
  const [shortResults, setShortResults] = useState<LatLongResponseType[]>([]);
  const [longResults, setLongResults] = useState<LatLongResponseType[]>([]);
  const [partyResults, setPartyResults] = useState<LatLongResponseType[]>([]);
  const [isMultiThreaded, setIsMultiThreaded] = useState<boolean>(true);
  const [smallBatchSize, setSmallBatchSize] = useState<number>(BATCH_SIZE.small);
  const [largeBatchSize, setLargeBatchSize] = useState<number>(BATCH_SIZE.large);
  const [viewBox, setViewBox] = useState<LatLongResponseType>({
    lat: EXT_VBOX_START_LAT,
    lng: EXT_VBOX_START_LNG,
  });
  const getSmBS = () => (smallBatchSize > BATCH_SIZE.smallMax ? BATCH_SIZE.small : smallBatchSize);
  const getLgBS = () => (largeBatchSize > BATCH_SIZE.largeMax ? BATCH_SIZE.large : largeBatchSize);

  // primary middleware orchestrators, since lacking a true middlware store for this demo
  // single-threaded must perform data fetch AND CPU calc on single thread via getBlockingDataSet
  const smallWorkloadHandler = async () => {
    setShortResults([]);
    const isMT = isMultiThreaded;
    const result = isMT
      ? await smallWorker({
          url: BASE_URL,
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getSmBS(),
          isSmall: true,
        })
      : await getBlockingDataSet({
          url: BASE_URL,
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getSmBS(),
          isSmall: true,
        });
    const workerResults = [] as LatLongResponseType[];
    if (result.nextToken.lat > 0) {
      let pageNum = 1;
      // handle paginated results multi or single threaded
      workerResults.push(...result.results);
      setShortResults([...workerResults, ...result.results]);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        const startLat = paginatedResult.nextToken.lat;
        const startLng = paginatedResult.nextToken.lng;
        paginatedResult = isMT
          ? await smallWorker({
              url: BASE_URL,
              startLat,
              startLng,
              batchSize: getSmBS(),
              isSmall: true,
              pageNum,
            })
          : await getBlockingDataSet({
              url: BASE_URL,
              startLat,
              startLng,
              batchSize: getSmBS(),
              isSmall: true,
              pageNum,
            });
        workerResults.push(...paginatedResult.results);
        setShortResults([...workerResults, ...paginatedResult.results]);
        pageNum++;
      }
    } else {
      workerResults.push(...result.results);
      setShortResults([...workerResults, ...result.results]);
    }
  };
  const largeWorkloadHandler = async () => {
    setLongResults([]);
    const isMT = isMultiThreaded;
    const result = isMT
      ? await largeWorker({
          url: BASE_URL,
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getLgBS(),
        })
      : await getBlockingDataSet({
          url: BASE_URL,
          startLat: viewBox.lat,
          startLng: viewBox.lng,
          batchSize: getLgBS(),
        });
    const workerResults = [] as LatLongResponseType[];
    if (result.nextToken.lat > 0) {
      // handle paginated results multi or single threaded
      workerResults.push(...result.results);
      setLongResults([...workerResults, ...result.results]);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        let pageNum = 1;
        const startLat = paginatedResult.nextToken.lat;
        const startLng = paginatedResult.nextToken.lng;
        paginatedResult = isMT
          ? await largeWorker({
              url: BASE_URL,
              startLat,
              startLng,
              batchSize: getLgBS(),
              pageNum,
            })
          : await getBlockingDataSet({
              url: BASE_URL,
              startLat,
              startLng,
              batchSize: getLgBS(),
              pageNum,
            });
        workerResults.push(...paginatedResult.results);
        setLongResults([...workerResults, ...paginatedResult.results]);
        pageNum++;
      }
    } else {
      workerResults.push(...result.results);
      setLongResults([...workerResults, ...result.results]);
    }
  };
  // party handler!
  const partyWorkloadHandler = async () => {
    setWorkerResults([]);
    const url = `${BASE_URL}/party`;
    const isMT = isMultiThreaded;
    const result = isMT
      ? await partyWorker({ url, startLat: viewBox.lat, startLng: viewBox.lng })
      : await getBlockingDataSet({ url, startLat: viewBox.lat, startLng: viewBox.lng });
    const workerResults = [] as LatLongResponseType[];
    if (result.nextToken.lat > 0) {
      let pageNum = 1;
      // handle paginated results multi or single threaded
      workerResults.push(...result.results);
      setPartyResults([...workerResults, ...result.results]);
      let paginatedResult = {
        results: [] as LatLongResponseType[],
        nextToken: { ...result.nextToken },
      };
      while (paginatedResult.nextToken.lat > 0) {
        paginatedResult = isMT
          ? await partyWorker({
              url,
              startLat: viewBox.lat,
              startLng: viewBox.lng,
              pageNum,
            })
          : await getBlockingDataSet({
              url,
              startLat: viewBox.lat,
              startLng: viewBox.lng,
              pageNum,
            });
        workerResults.push(...paginatedResult.results);
        setPartyResults([...workerResults, ...paginatedResult.results]);
        pageNum++;
      }
    } else {
      workerResults.push(...result.results);
      setPartyResults([...workerResults, ...result.results]);
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
      <div className={'app-container--sidenav'} aria-label={'app-container-sidenav'}>
        <SideNav
          multiThreadedCheckedHandler={multiThreadedCheckedHandler}
          smallWorkerHandler={smallWorkerHandler}
          largeWorkerHandler={largeWorkerHandler}
          partyWorkerHandler={partyWorkerHandler}
          smallWorkerResults={shortResults?.length}
          largeWorkerResults={longResults?.length}
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
            latLngMarkerCoords={shortResults}
            longLatLngMarkerCoords={longResults}
            partyLatLngMarkerCoords={partyResults}
            workerResults={workerResults || ([] as WorkerDataResponseType[])}
          />
        </div>
      </div>
    </div>
  );
};
export default AppContainer;
