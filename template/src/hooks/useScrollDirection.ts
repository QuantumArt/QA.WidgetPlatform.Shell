import { useEffect, useState } from 'react';

export enum ScrollDirection {
  UP = 'up',
  DOWN = 'down',
}

let previousScrollYPosition = 0;
let scrollDir = ScrollDirection.DOWN;

if (typeof window !== 'undefined') {
  previousScrollYPosition = window.scrollY;
}

const threshold = 50;
const scrolledMoreThanThreshold = (currentScrollYPosition: number) =>
  Math.abs(currentScrollYPosition - previousScrollYPosition) > threshold;

const isScrollingUp = (currentScrollYPosition: number) =>
  currentScrollYPosition > previousScrollYPosition &&
  !(previousScrollYPosition > 0 && currentScrollYPosition === 0) &&
  !(currentScrollYPosition > 0 && previousScrollYPosition === 0);

export const getScrollDirection = () => {
  if (typeof window === 'undefined') {
    return scrollDir;
  }
  
  const currentScrollYPosition = window.scrollY;
  if (scrolledMoreThanThreshold(currentScrollYPosition)) {
    scrollDir = isScrollingUp(currentScrollYPosition) ? ScrollDirection.DOWN : ScrollDirection.UP;
    previousScrollYPosition = currentScrollYPosition > 0 ? currentScrollYPosition : 0;
  }
  return scrollDir;
};

// export const useScrollDirection = () => {
//   const threshold = 50;
//   const [scrollDir, setScrollDir] = useState(ScrollDirection.DOWN);

//   useEffect(() => {
//     let previousScrollYPosition = window.scrollY;

//     const scrolledMoreThanThreshold = (currentScrollYPosition: number) =>
//       Math.abs(currentScrollYPosition - previousScrollYPosition) > threshold;

//     const isScrollingUp = (currentScrollYPosition: number) =>
//       currentScrollYPosition > previousScrollYPosition &&
//       !(previousScrollYPosition > 0 && currentScrollYPosition === 0) &&
//       !(currentScrollYPosition > 0 && previousScrollYPosition === 0);

//     const updateScrollDirection = () => {
//       const currentScrollYPosition = window.scrollY;

//       if (scrolledMoreThanThreshold(currentScrollYPosition)) {
//         const newScrollDirection = isScrollingUp(currentScrollYPosition)
//           ? ScrollDirection.DOWN
//           : ScrollDirection.UP;
//         setScrollDir(newScrollDirection);
//         previousScrollYPosition = currentScrollYPosition > 0 ? currentScrollYPosition : 0;
//       }
//     };

//     const onScroll = () => window.requestAnimationFrame(updateScrollDirection);

//     window.addEventListener('scroll', onScroll);

//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   return scrollDir;
// };
