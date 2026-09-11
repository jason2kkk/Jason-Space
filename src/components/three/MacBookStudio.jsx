import React from 'react';
import MacBookModel from './MacBookModel';

export default function MacBookStudio() {
  return (
    <main className="macbook-studio">
      <header className="macbook-studio__header">
        <div>
          <p className="macbook-studio__eyebrow">THREE.JS MODEL LAB</p>
          <h1>MacBook Pro</h1>
          <p className="macbook-studio__copy">Standalone 3D model preview</p>
        </div>
        <a className="macbook-studio__back" href="/">Back to Jason&apos;s Space</a>
      </header>
      <section className="macbook-studio__stage" aria-label="Standalone interactive MacBook Pro model">
        <MacBookModel className="macbook-studio__model" />
        <div className="macbook-studio__hint">Drag to rotate</div>
      </section>
    </main>
  );
}
