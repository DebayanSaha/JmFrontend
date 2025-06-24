import { useState, useEffect } from 'react';
import breakpoints from './styles/breakpoints';

/**
 * useResponsive - Unified responsive hook for standardized breakpoints
 * @returns {object} { isXs, isSm, isMd, isLg, isXl, current, width }
 */
export function useResponsive() {
  const getBreakpoint = (width) => {
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    return 'xl';
  };

  const [width, setWidth] = useState(window.innerWidth);
  const [current, setCurrent] = useState(getBreakpoint(window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setCurrent(getBreakpoint(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isXs: width < breakpoints.sm,
    isSm: width >= breakpoints.sm && width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl,
    current,
    width,
  };
}

export default useResponsive; 