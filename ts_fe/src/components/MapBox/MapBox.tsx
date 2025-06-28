import { useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import MapMarker from '../../assets/mapmarker.svg';
import AltMapMarker from '../../assets/mapmarker-alt.svg';
import Screw from '../../assets/screw.svg'
import { type LatLongResponseType } from '../../services/appDataService';
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
  latLngMarkerCoords?: LatLongResponseType[];
  longLatLngMarkerCoords?: LatLongResponseType[];
  renderer?: MapBoxRenderersType;
};

// add to your local .env file in the root of ts_fe:
// VITE_MAP_URL="https://api.maptiler.com/maps/streets-v2/style.json?key=<your_API_key>"
// maptiler API keys & signup is free!
const MAP_URL = import.meta.env.VITE_MAP_URL; 

// simple MapBox component render switching for the purpose of the demo
const MapBox = ({
  startLat,
  startLng,
  renderer = MapBoxRenderers.reactMapGl,
  latLngMarkerCoords = [],
  longLatLngMarkerCoords = [],
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
  console.log()
  return (
    <div className={'mapbox-container'}>
      <div className={'mapbox-container--renderer'}>
      <div className={'mapbox-container--renderer-screw'}><img src={Screw}/></div>
      <div className={'mapbox-container--renderer-screw'}><img src={Screw}/></div>
      <div className={'mapbox-container--renderer-screw'}><img src={Screw}/></div>
      <div className={'mapbox-container--renderer-screw'}><img src={Screw}/></div>
        {renderer === MapBoxRenderers.reactMapGl ? (
          <Map
            initialViewState={{
              longitude: startLng,
              latitude: startLat,
              zoom: 11.5,
            }}
            mapStyle={MAP_URL}
            mapLib={import('maplibre-gl')}
          >
            {[...markers, ...longMarkers]}
          </Map>
        ) : (
          <span>Invalid mapbox renderer selected, please try again.</span>
        )}
      </div>
    </div>
  );
};
export default MapBox;
