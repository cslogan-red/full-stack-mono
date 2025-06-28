import { RouterProvider } from 'react-router-dom';
import { router } from '../../routes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
// styles
import './App.scss';

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {/* Main App Container */}
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  );
}

export default App;
