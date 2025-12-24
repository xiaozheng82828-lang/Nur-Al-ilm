import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = "<h1>❌ Root element nahi mila! index.html check karein.</h1>";
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div style={{ backgroundColor: 'green', color: 'white', padding: '20px', fontSize: '30px', textAlign: 'center' }}>
      <h1>✅ Site Chal Gayi!</h1>
      <p>Iska matlab Settings sahi hain, galti App.tsx ke code mein hai.</p>
    </div>
  );
}
