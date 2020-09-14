import React from 'react';

export function useClickOutside(ref, handler) {
  React.useEffect(() => {
    function clickHandler(event) {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      handler();
    }

    document.addEventListener('mousedown', clickHandler);

    return () => {
      document.removeEventListener('mousedown', clickHandler);
    };
  }, [handler, ref]);
}
