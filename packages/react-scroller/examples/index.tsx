import React from 'react';
import { render } from 'react-dom';

import { Scroller } from '../src/Scroller';

const options = {
  wheelScrollSpeedRatio: 1,
  dragScrollSpeedRatio: 1,
  scrollBarClassNameX: 'scrollbar-x',
  scrollBarClassNameY: 'scrollbar-y',
}

const App: React.FC = () => {
  const items = React.useMemo(() => Object.keys(Array.from(Array(100))), [])
  return (
    <Scroller options={options}>
      {() => (
        <div id="content">
          {items.map((i) => (
            <div key={i} className="content-item">
              {i}
            </div>
          ))}
        </div>
      )}
    </Scroller>
  )
}

const root = document.getElementById('root')!
render(<App />, root)
