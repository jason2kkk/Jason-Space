import React, { lazy, Suspense } from 'react';
import './App.css';
import { MacHero } from './components/sections/mac-hero';

const OsDesktop = lazy(() => (
  import('./components/sections/os-desktop').then((mod) => ({ default: mod.OsDesktop }))
));

const previewDesktop = () => (
  typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('desktop') === '1'
);

function App() {
  if (previewDesktop()) {
    return (
      <Suspense fallback={null}>
        <OsDesktop
          interactive
          lockScroll
          onBack={() => {
            window.location.assign('/');
          }}
          className="fixed inset-0"
        />
      </Suspense>
    );
  }

  return <MacHero />;
}

export default App;
