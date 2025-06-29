import { render, cleanup } from '@testing-library/react';
import SideNav from '../../components/SideNav/SideNav';

// mock vite meta imports until better solution
jest.mock('../../constants', () => ({
  VITE_MAP_URL: 'localhost',
}));

describe('MapBox tests', () => {
  // setup/cleanup
  afterEach(cleanup);
  it('SideNav can render without error', () => {
    const handler = () => {};
    const { queryByLabelText } = render(
      <SideNav
        multiThreadedCheckedHandler={handler}
        smallItemCountHandler={handler}
        largeItemCountHandler={handler}
        smallWorkerHandler={{
          kill: handler,
          status: '',
          clickHandler: handler,
        }}
        largeWorkerHandler={{
          kill: handler,
          status: '',
          clickHandler: handler,
        }}
        smallWorkerResults={undefined}
        largeWorkerResults={undefined}
      />,
    );
    expect(queryByLabelText(/sidenav/i)).toBeTruthy();

    //fireEvent.click(getByLabelText(/off/i));
    //expect(queryByLabelText(/on/i)).toBeTruthy();
  });
});
