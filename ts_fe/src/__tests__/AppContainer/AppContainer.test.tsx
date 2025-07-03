import { render, cleanup } from '@testing-library/react';
import AppContainer from '../../components/AppContainer/AppContainer';

// mock vite meta imports until better solution
jest.mock('../../constants', () => ({
  VITE_MAP_URL: 'test',
}));

describe('AppContainer tests', () => {
  // setup/cleanup
  afterEach(cleanup);
  it('can render AppContainer without error', () => {
    const { queryByLabelText } = render(<AppContainer />);
    expect(queryByLabelText('app-container')).toBeTruthy();
  });

  it('can render AppContainer map without error', () => {
    const { queryByLabelText } = render(<AppContainer />);
    expect(queryByLabelText('app-container-map')).toBeTruthy();
  });

  it('can render AppContainer side nav without error', () => {
    const { queryByLabelText } = render(<AppContainer />);
    expect(queryByLabelText('app-container-sidenav')).toBeTruthy();
  });
});
