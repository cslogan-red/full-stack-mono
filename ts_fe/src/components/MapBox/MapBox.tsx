import { useMemo, useState } from 'react';
import Map, {
  Marker,
  type MapLayerTouchEvent,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import MapMarker from '../../assets/mapmarker.svg';
import AltMapMarker from '../../assets/mapmarker-alt.svg';
import Screw from '../../assets/screw.svg';
import { type LatLongResponseType } from '../../services/appDataService';
import { VITE_MAP_URL } from '../../constants';
// styles
import './MapBox.scss';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MapBoxRenderers = {
  reactMapGl: 'react-map-gl',
} as const;

export type MapBoxRenderersType = (typeof MapBoxRenderers)[keyof typeof MapBoxRenderers];

type MapBoxMarkerType = LatLongResponseType & { infoText?: string };

type MapBoxProps = {
  startLat: number;
  startLng: number;
  boundingBoxHandler?: (latlng: LatLongResponseType) => void;
  latLngMarkerCoords?: MapBoxMarkerType[];
  longLatLngMarkerCoords?: MapBoxMarkerType[];
  partyLatLngMarkerCoords?: MapBoxMarkerType[];
  workerResults?: MapBoxMarkerType[];
  isPartyMode?: boolean;
  renderer?: MapBoxRenderersType;
};

// add to your local .env file in the root of ts_fe:
// VITE_MAP_URL="https://api.maptiler.com/maps/streets-v2/style.json?key=<your_API_key>"
// maptiler API keys & signup is free!
const MAP_URL = VITE_MAP_URL;

// simple MapBox component render switching for the purpose of the demo
const MapBox = ({
  startLat,
  startLng,
  boundingBoxHandler,
  renderer = MapBoxRenderers.reactMapGl,
  latLngMarkerCoords = [],
  longLatLngMarkerCoords = [],
  partyLatLngMarkerCoords = [],
  workerResults,
}: MapBoxProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [infoBody, setInfoBody] = useState<React.ReactElement | null>(null);
  const infoHandler = (coords: MapBoxMarkerType) => {
    setShowInfo(false);
    setInfoBody(
      <>
        <div>Location latitude: {coords.lat}</div>
        <div>Location longitude: {coords.lng}</div>
        <div>
          {coords.infoText ? `Location detail: ${coords.infoText}` : 'Fetching location detail...'}
        </div>
      </>,
    );
    setShowInfo(true);
  };
  const mapper = (coords: MapBoxMarkerType, i: number) => (
    <Marker
      key={`${coords.lat * Math.random()}-m`}
      longitude={coords.lng}
      latitude={coords.lat}
      onClick={() => infoHandler(coords)}
    >
      <div key={`${coords.lat * Math.random()}-d`} className={'marker'}>
        <img key={`${coords.lat * Math.random()}-i`} src={i % 2 === 0 ? MapMarker : AltMapMarker} />
      </div>
    </Marker>
  );
  // track results as they stream in from background worker threads
  const workerMarkers = useMemo(
    () => (workerResults && workerResults?.length > 0 ? workerResults.map(mapper) : undefined),
    [workerResults],
  );
  const markers = useMemo(() => latLngMarkerCoords.map(mapper), [latLngMarkerCoords]);
  const longMarkers = useMemo(() => longLatLngMarkerCoords.map(mapper), [longLatLngMarkerCoords]);
  const partyMarkers = useMemo(
    () => partyLatLngMarkerCoords.map(mapper),
    [partyLatLngMarkerCoords],
  );
  return (
    <div className={'mapbox-container'} aria-label={'mapbox-container'}>
      <div className={'mapbox-container--renderer'}>
        <div className={'mapbox-container--renderer-screw'} aria-label={'mapbox-container-screw'}>
          <img src={Screw} />
        </div>
        <div className={'mapbox-container--renderer-screw'}>
          <img src={Screw} />
        </div>
        <div className={'mapbox-container--renderer-screw'}>
          <img src={Screw} />
        </div>
        <div className={'mapbox-container--renderer-screw'}>
          <img src={Screw} />
        </div>
        {renderer === MapBoxRenderers.reactMapGl ? (
          <Map
            initialViewState={{
              longitude: startLng,
              latitude: startLat,
              zoom: 11.5,
            }}
            mapStyle={MAP_URL}
            mapLib={import('maplibre-gl')}
            onMouseUp={(e: MapLayerMouseEvent) => {
              if (boundingBoxHandler) {
                boundingBoxHandler({ lat: e.lngLat.lat, lng: e.lngLat.lng });
              }
            }}
            onTouchEnd={(e: MapLayerTouchEvent) => {
              if (boundingBoxHandler) {
                boundingBoxHandler({ lat: e.lngLat.lat, lng: e.lngLat.lng });
              }
            }}
          >
            {workerMarkers ? [...workerMarkers] : [...markers, ...longMarkers, ...partyMarkers]}
          </Map>
        ) : (
          <span>Invalid mapbox renderer selected, please try again.</span>
        )}
      </div>
      <div className={`mapbox-container--info ${showInfo ? 'active' : ''}`}>{infoBody}</div>
    </div>
  );
};
export default MapBox;
