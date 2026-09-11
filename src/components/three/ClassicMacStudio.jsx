import React from 'react';
import ClassicMacModel from './ClassicMacModel';

export default function ClassicMacStudio() {
  return (
    <main className="macbook-studio">
      <header className="macbook-studio__header">
        <div>
          <p className="macbook-studio__eyebrow">BLENDER PREVIEW</p>
          <h1>Classic Mac</h1>
          <p className="macbook-studio__copy">Standalone GLB lab — does not affect the desk or OS desktop</p>
        </div>
        <a className="macbook-studio__back" href="/">Back to Jason&apos;s Space</a>
      </header>
      <section className="macbook-studio__stage" aria-label="Standalone classic Macintosh model">
        <ClassicMacModel className="macbook-studio__model" />
        <div className="macbook-studio__hint">Drag to orbit · Scroll to zoom</div>
      </section>
    </main>
  );
}
