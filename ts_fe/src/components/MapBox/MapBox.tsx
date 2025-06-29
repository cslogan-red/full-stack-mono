import { useMemo } from 'react';
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

type MapBoxProps = {
  startLat: number;
  startLng: number;
  boundingBoxHandler?: (latlng: LatLongResponseType) => void;
  latLngMarkerCoords?: LatLongResponseType[];
  longLatLngMarkerCoords?: LatLongResponseType[];
  partyLatLngMarkerCoords?: LatLongResponseType[];
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
}: MapBoxProps) => {
  // track results as they stream in from background worker threads
  const markers = useMemo(
    () =>
      latLngMarkerCoords.map((coords) => (
        <Marker key={`${coords.lat}-m`} longitude={coords.lng} latitude={coords.lat}>
          <div key={`${coords.lat}-d`} className={'marker'}>
            <img key={`${coords.lat}-i`} src={AltMapMarker} />
          </div>
        </Marker>
      )),
    [latLngMarkerCoords],
  );
  const longMarkers = useMemo(
    () =>
      longLatLngMarkerCoords.map((coords) => (
        <Marker key={`${coords.lat}-m`} longitude={coords.lng} latitude={coords.lat}>
          <div key={`${coords.lat}-d`} className={'marker'}>
            <img key={`${coords.lat}-i`} src={MapMarker} />
          </div>
        </Marker>
      )),
    [longLatLngMarkerCoords],
  );
  const partyMarkers = useMemo(
    () =>
      partyLatLngMarkerCoords.map((coords, i) => (
        <Marker key={`${coords.lat}-m`} longitude={coords.lng} latitude={coords.lat}>
          <div key={`${coords.lat}-d`} className={'marker'}>
            <img key={`${coords.lat}-i`} src={i % 2 === 0 ? MapMarker : AltMapMarker} />
          </div>
        </Marker>
      )),
    [longLatLngMarkerCoords],
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
            {[...markers, ...longMarkers, ...partyMarkers]}
          </Map>
        ) : (
          <span>Invalid mapbox renderer selected, please try again.</span>
        )}
      </div>
    </div>
  );
};
export default MapBox;
