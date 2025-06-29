import { render, cleanup } from '@testing-library/react';
import MapBox from '../../components/MapBox/MapBox';

// mock vite meta imports until better solution
jest.mock('../../constants', () => ({
  VITE_MAP_URL: 'localhost',
}));

describe('MapBox tests', () => {
  // setup/cleanup
  afterEach(cleanup);
  it('MapBox can render without error', () => {
    const { queryByLabelText } = render(<MapBox startLat={1} startLng={1} />);
    expect(queryByLabelText(/mapbox/i)).toBeTruthy();

    //fireEvent.click(getByLabelText(/off/i));
    //expect(queryByLabelText(/on/i)).toBeTruthy();
  });
});
