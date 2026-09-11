import React from 'react';
import './App.css';
import { MacHero } from './components/sections/mac-hero';
import { OsDesktop } from './components/sections/os-desktop';
import ClassicMacStudio from './components/three/ClassicMacStudio';
import MacBookStudio from './components/three/MacBookStudio';

const previewDesktop = () => (
  typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('desktop') === '1'
);

const previewMacBook = () => (
  typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('macbook') === '1'
);

const previewClassicMac = () => (
  typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('mac') === '1'
);

function App() {
  if (previewClassicMac()) {
    return <ClassicMacStudio />;
  }

  if (previewMacBook()) {
    return <MacBookStudio />;
  }

  if (previewDesktop()) {
    return (
      <OsDesktop
        interactive
        lockScroll
        scanlineOpacity={0}
        onBack={() => {
          window.location.assign('/');
        }}
        className="fixed inset-0"
      />
    );
  }

  return <MacHero />;
}

export default App;
