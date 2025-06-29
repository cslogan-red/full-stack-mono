import { render, cleanup } from '@testing-library/react';
import AppContainer from '../../components/AppContainer/AppContainer';

// mock vite meta imports until better solution
jest.mock('../../constants', () => ({
  VITE_MAP_URL: 'localhost',
}));

describe('AppContainer tests', () => {
  // setup/cleanup
  afterEach(cleanup);
  it('AppContainer can render without error', () => {
    const { queryByLabelText } = render(<AppContainer />);
    expect(queryByLabelText(/app-container/i)).toBeTruthy();

    //fireEvent.click(getByLabelText(/off/i));
    //expect(queryByLabelText(/on/i)).toBeTruthy();
  });
});
