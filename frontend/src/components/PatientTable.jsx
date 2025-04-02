import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const PatientTable = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5003/api/patients');
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        setPatients(data.patients);
      } catch (err) {
        setError('Error loading patients');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <div className="w-3/4 text-center">
          Loading patients...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center pt-10">
        <div className="w-3/4 text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-10">
      <div className="w-3/4 overflow-x-auto">
        <div className="border border-gray-300 rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#20cc5c] text-white sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-start text-md font-medium uppercase">Patient ID</th>
                <th className="px-6 py-3 text-start text-md font-medium uppercase">Patient Name</th>
                <th className="px-6 py-3 text-start text-md font-medium uppercase">Email</th>
                <th className="px-6 py-3 text-start text-md font-medium uppercase">Phone</th>
                <th className="px-12 py-3 text-end text-md font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(patients) && patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.patient_id} className="odd:bg-white even:bg-[#e1f9e1] hover:bg-[#b2f5b2]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {patient.patient_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <Link 
                        to={`/profile/${patient.patient_id}`}
                        className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-[#1adb5d] hover:bg-[#d0f7d0] hover:text-[#149c47] py-1 px-3"
                      >
                        View Patient
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan="5">
                    No patients available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientTable;
