import { useState } from 'react';
import api from '../axiosServer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  const [backendMessage, setBackendMessage] = useState('Click the button to connect to the backend!');

  const fetchMessage = async () => {
    try {
      const response = await api.get('/');
      setBackendMessage(response.data.message);
    } catch (error) {
      setBackendMessage('Failed to connect to backend.');
      console.error(error);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center ">
      <h1 className="display-4 fw-bold mb-4">Expense Reports</h1>
      <p className="lead mb-6 text-center">{backendMessage}</p>
      <button onClick={fetchMessage} className="btn btn-secondary btn-lg shadow">
        check the Backend
      </button>
    </div>
  );
}

export default App;