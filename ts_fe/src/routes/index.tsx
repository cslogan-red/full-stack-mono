import { Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
// Components
import AppContainer from '../components/AppContainer/AppContainer.tsx';
import About from '../components/About/About.tsx';

export const router = createBrowserRouter([
  ...createRoutesFromElements(
    <Route
      path="/"
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <AppContainer />
        </Suspense>
      }
    >
      <Route
        path="about"
        element={
          <Suspense fallback={<div>Loading About...</div>}>
            <About />
          </Suspense>
        }
      />
    </Route>,
  ),
]);
