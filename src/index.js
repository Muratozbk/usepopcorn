import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import StarRating from './StarRating';
// import './index.css';
// import App from './App';

function Test() {
  const [movieRating, setMovieRating] = useState(0);
  const defaultTest = 3;

  return (
    <div>
      <StarRating color='blue' maxRating={10}
        onSetRating={setMovieRating} defaultRating={defaultTest} />
      <p>This movie was rated {movieRating || defaultTest} stars </p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating maxRating={5} messages={['Terrible',
      'Bad', 'Okay', 'Good', 'Amazing']} />
    <StarRating size={24} color='green' className='test'
      defaultRating={4} />

    <Test />
  </React.StrictMode>
);


