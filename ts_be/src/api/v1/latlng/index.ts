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

const pageinateResponse = (props: {
  pageNum: number;
  pageSize: number;
  acc: LatLongType[];
}): LatLongResponseType => {
  const { pageNum, pageSize, acc } = props;
  const returnVal = {
    results: acc,
    nextToken: { lat: 0, lng: 0 },
  };
  if (pageNum) {
    // n+1 pagination
    const sI = pageNum * pageSize;
    const pageAcc: LatLongType[] = [...acc.slice(sI, sI + pageSize)];
    if (sI + pageSize >= acc.length) {
      returnVal.nextToken = { lat: 0, lng: 0 };
      returnVal.results = [...pageAcc];
    } else {
      returnVal.nextToken = pageAcc[pageAcc.length - 1];
      returnVal.results = [...pageAcc];
    }
  } else {
    // first page, possible pagination
    if (acc.length <= pageSize) {
      returnVal.results = [...acc];
    } else {
      returnVal.results = [...acc.slice(0, pageSize)];
      returnVal.nextToken = acc[pageSize - 1];
    }
  }
  return returnVal;
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
  let returnVal = {
    results: acc,
    nextToken: { lat: 0, lng: 0 },
  };
  const { startLat, startLng, batchSize = 25, isSmall, pageNum } = query;
  const START_LNG =
    isSmall === "true" ? Number(`${startLng}`) - 0.05 : Number(`${startLng}`);
  const START_LAT =
    isSmall === "true" ? Number(`${startLat}`) - 0.05 : Number(`${startLat}`);
  const PAGE_SIZE = 25;
  // calculate the entire possible list based on the input batch size
  const ARC_DEGREE_SEP = isSmall ? 0.000012 : 0.00001;
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
      acc.length === 0
        ? START_LAT - latSep
        : acc[i - 1].lat + latSep - (isSmall === "true" ? 0.001 : 0);
    currentResult.lng =
      acc.length === 0
        ? START_LNG - lngSep
        : acc[i - 1].lng + lngSep - (isSmall === "true" ? 0.001 : 0);
    acc.push(currentResult);
  }
  // paginate based on PAGE_SIZE
  returnVal = {
    ...pageinateResponse({
      pageNum: parseInt(pageNum as string),
      pageSize: PAGE_SIZE,
      acc,
    }),
  };
  return returnVal;
};

// randomized view box results based on given input coords, party mode!
export const getLatLngParty = async (
  props: LatLongRequestType,
): Promise<LatLongResponseType> => {
  const query = props?.req?.query;
  const acc: LatLongType[] = [];
  let returnVal = {
    results: acc,
    nextToken: { lat: 0, lng: 0 },
  };
  const batchSize = 1000;
  const PAGE_SIZE = 100;
  const { startLat, startLng, pageNum } = query;
  const START_LNG = startLng ? parseFloat(startLng as string) : -122.4;
  const START_LAT = startLat ? parseFloat(startLat as string) : 37.8;
  // calculate the entire possible list based on the input batch size
  for (let i = 0; i < batchSize; i++) {
    const ARC_DEGREE_SEP = 0.000001;
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
  // randomize locations and then the list itself
  acc
    .reduce((acc, val, i) => {
      const offset = parseInt(`${Math.random() / 1000000}`.charAt(0));
      const ARC_DEGREE_SEP_LAT =
        i % 7 === 0
          ? Number(`0.00${offset}`)
          : i % 9 === 0
            ? Number(`0.03${offset}`)
            : Number(`0.008${offset}`);
      const ARC_DEGREE_SEP_LNG =
        i % 5 === 0
          ? Number(`0.0000${offset}`)
          : i % 4 === 0
            ? Number(`0.000${offset}`)
            : i % 2 === 0
              ? Number(`0.00000${offset}`)
              : Number(`0.00003${offset}`);
      val.lat = parseFloat(
        Number(
          i % 2 === 0
            ? val.lat + offset * ARC_DEGREE_SEP_LAT
            : val.lat - offset * ARC_DEGREE_SEP_LAT,
        ).toPrecision(12),
      );
      val.lng = parseFloat(
        Number(
          i % 2 === 0
            ? val.lng - offset * ARC_DEGREE_SEP_LNG
            : val.lng + offset * ARC_DEGREE_SEP_LNG,
        ).toPrecision(12),
      );
      acc.push(val);
      return acc;
    }, [] as LatLongType[])
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  // paginate based on PAGE_SIZE
  returnVal = {
    ...pageinateResponse({
      pageNum: parseInt(pageNum as string),
      pageSize: PAGE_SIZE,
      acc,
    }),
  };
  return returnVal;
};
