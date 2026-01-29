import React from 'react';
import { Test3DCard } from '../ui/social-card';
import { Folder } from '../ui/folder';

export const ShowcaseSection = ({ lang }) => {
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col lg:flex-row gap-20 items-center justify-center">
        <div className="relative">
          <Test3DCard lang={lang} />
        </div>
        <div className="relative">
          <Folder />
        </div>
      </div>
    </div>
  );
}; 