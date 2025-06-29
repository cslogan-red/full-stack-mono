import { render, fireEvent, cleanup } from '@testing-library/react';
import SideNav from '../../components/SideNav/SideNav';

// mock vite meta imports until better solution
jest.mock('../../constants', () => ({
  VITE_MAP_URL: 'test',
}));

describe('SideNav tests', () => {
  // setup/cleanup
  afterEach(cleanup);
  it('can render SideNav without error', () => {
    const handler = () => {};
    const { queryByLabelText, getByLabelText } = render(
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
        partyWorkerHandler={{
          kill: handler,
          status: '',
          clickHandler: handler,
        }}
        smallWorkerResults={undefined}
        largeWorkerResults={undefined}
      />,
    );
    expect(queryByLabelText('sidenav-container')).toBeTruthy();

    fireEvent.click(getByLabelText('sidenav--content-switch'));
    expect(queryByLabelText('sidenav--content-switch')).toBeDefined();
  });
});
