import { Request } from "express";

type LatLongResponseType = {
  results: LatLongType[];
  nextToken: {
    lat: number;
    lng: number;
  };
};

type LatLongType = {
  lat: number;
  lng: number;
};

type LatLongRequestType = {
  req: Request;
};

/**
 * simple linear degress of lat/lng arc calculator for a given input number (batchSize) with
 * paginated response support in PAGE_SIZE up until all calculated results are returned
 *
 * @param props @LatLongRequestType
 * @returns @LatLongResponseType
 */
export const getLatLng = async (
  props: LatLongRequestType,
): Promise<LatLongResponseType> => {
  const query = props?.req?.query;
  const acc: LatLongType[] = [];
  const returnVal = {
    results: acc,
    nextToken: { lat: 0, lng: 0 },
  };
  const { startLat, startLng, batchSize = 25, isSmall } = query;
  const START_LNG = isSmall === "true" ? -122.4 : -122.3;
  const START_LAT = isSmall === "true" ? 37.8 : 37.7;
  const PAGE_SIZE = 25;
  // calculate the entire possible list based on the input batch size
  const ARC_DEGREE_SEP = 0.00001;
  for (let i = 0; i < parseInt(batchSize as string); i++) {
    const currentResult = { lat: 0, lng: 0 };
    const latSep =
      acc.length === 0
        ? START_LAT * ARC_DEGREE_SEP
        : acc[i - 1].lat * ARC_DEGREE_SEP;
    const lngSep =
      acc.length === 0
        ? START_LNG * ARC_DEGREE_SEP
        : acc[i - 1].lng * ARC_DEGREE_SEP;

    currentResult.lat =
      acc.length === 0 ? START_LAT - latSep : acc[i - 1].lat + latSep;
    currentResult.lng =
      acc.length === 0 ? START_LNG - lngSep : acc[i - 1].lng + lngSep;
    acc.push(currentResult);
  }
  // if the batch size is greater than PAGE_SIZE, handle pagination by searching
  // for window within complete list of options
  if (startLat && startLng) {
    // n+1 pagination
    const sI = acc.findIndex((val) => `${val.lat}` === `${startLat}`);
    const pageAcc: LatLongType[] = [];
    for (let i = sI + 1; i < (sI + 1) * 2; i++) {
      if (acc[i]) {
        pageAcc.push(acc[i]);
      }
    }
    if (
      pageAcc.length === PAGE_SIZE &&
      sI * 2 !== parseInt(batchSize as string) - 2
    ) {
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
  return returnVal;
};
