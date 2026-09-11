import React from 'react';
import './App.css';
import { MacHero } from './components/sections/mac-hero';
import { OsDesktop } from './components/sections/os-desktop';

const previewDesktop = () => (
  typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('desktop') === '1'
);

function App() {
  if (previewDesktop()) {
    return (
      <OsDesktop
        interactive
        lockScroll
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
