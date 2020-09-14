import React from 'react';

export function usePrevious(value) {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
