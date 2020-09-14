import React from 'react';

import { observer } from 'utils';

function Label({ label, onClick, id, className, prefix }) {
  if (!label) return null;

  return (
    <label htmlFor={id} onClick={onClick} className={className}>
      {Boolean(prefix) && prefix()}
      {label}
    </label>
  );
}

// Label.propTypes = {
//   id: PropTypes.string.isRequired,
//   label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
//   prefix: PropTypes.func,
//   onClick: PropTypes.func,
//   className: PropTypes.string,
// };

export const LabelConnected = observer(Label);
