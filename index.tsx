import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Error Pakadne Wala Jasoos ---
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: '#xffdddd', border: '2px solid red', margin: '20px' }}>
          <h2>⚠️ Galti Pakdi Gayi:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {this.state.error?.toString()}
          </pre>
          <p>👆 Iska screenshot lekar Gemini ko bhejein.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = "<h1>Root element nahi mila</h1>";
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
