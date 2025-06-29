import { render, cleanup } from '@testing-library/react';
import MapBox from '../../components/MapBox/MapBox';

// mock vite meta imports until better solution
jest.mock('../../constants', () => ({
  VITE_MAP_URL: 'test',
}));

describe('MapBox tests', () => {
  // setup/cleanup
  afterEach(cleanup);
  it('can render Mapbox without error', () => {
    const { queryByLabelText } = render(<MapBox startLat={1} startLng={1} />);
    expect(queryByLabelText('mapbox-container')).toBeTruthy();
    expect(queryByLabelText('mapbox-container-screw')).toBeTruthy();
  });
});
