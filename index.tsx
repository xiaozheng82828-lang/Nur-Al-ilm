import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Ye Error Pakadne Wala Jasoos Hai ---
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', fontSize: '18px', wordBreak: 'break-word' }}>
          <h1>⚠️ Error Pakda Gaya:</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <p>Iska screenshot lekar Gemini ko bhejein.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = "<h1 style='color:red'>Root element gayab hai! index.html check karein.</h1>";
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
