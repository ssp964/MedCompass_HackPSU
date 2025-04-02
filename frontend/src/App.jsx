import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PatientForm from './pages/PatientForm';
import PatientProfile from './pages/PatientProfile';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/addPatient" element={<PatientForm />} />
      <Route path="/profile/:patientId" element={<PatientProfile />} />

    </Routes>
  );
}

export default App;
