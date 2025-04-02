import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PatientProfile = () => {
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    preferredTime: ""
  });

  const [hospitalizations, setHospitalizations] = useState([]);

  const [admissionData, setAdmissionData] = useState({
    diagnosis: "",
    allergies: "",
    admitDate: "",
  });

  const [dischargeData, setDischargeData] = useState({
    hospitalizationId: "",
    dischargeDate: "",
    dischargeInstructions: "",
    followUpDate: "" // Add this field
  });

  const [callSchedule, setCallSchedule] = useState([
    {
      id: 1,
      hospitalizationId: 1,
      callDate: "2025-03-01",
      questions: ["pain", "medication"],
      called: true
    }
  ]);

  const [newCall, setNewCall] = useState({
    hospitalizationId: "",
    callDate: "",
    callTime: "", // Add this new field
    questions: [],
    called: false
  });

  const questionOptions = [
    { value: "neuro", label: "Neurological Conditions" },
    { value: "cancer", label: "Cancer" },
    { value: "respiratory", label: "Respiratory Conditions" },
    { value: "general_surgery", label: "General Surgery" },
    { value: "diabetes", label: "Diabetes" },
    { value: "cardio", label: "Cardiovascular Conditions" }
  ];

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/patients/${patientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const data = await response.json();
        
        // Transform MongoDB data to match component state structure
        setPatientData({
          firstName: data.first_name,
          lastName: data.last_name,
          dateOfBirth: data.dob,
          gender: data.gender,
          phoneNumber: data.phone,
          email: data.email,
          preferredTime: data.preferred_call_time
        });
      } catch (err) {
        setError('Error loading patient data');
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  useEffect(() => {
    const fetchMedicalData = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/medical/${patientId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch medical data');
        }
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setHospitalizations(data.map(record => ({
            id: record.hospitalization_id,
            diagnosis: record.diagnosis,
            allergies: record.allergies,
            admitDate: record.admit_date,
            dischargeDate: record.discharge_date || null,
            dischargeInstructions: record.discharge_instructions || null,
            followUpDate: record.follow_up_app_date
          })));
        }
      } catch (err) {
        console.error('Error fetching medical data:', err);
      }
    };

    if (patientId) {
      fetchMedicalData();
    }
  }, [patientId]);

  useEffect(() => {
    const fetchCallSchedule = async () => {
      try {
        if (!hospitalizations.length) {
          setCallSchedule([]);
          return;
        }

        const hospitalizationIds = hospitalizations.map(h => h.id);
        
        const response = await fetch('http://localhost:5003/api/discharge-calls/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hospitalizationIds })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch call schedule');
        }

        const result = await response.json();
        
        if (result.success) {
          setCallSchedule(result.calls.map(call => ({
            id: call.call_report_id,
            hospitalizationId: call.hospitalization_id,
            callDate: call.call_date,
            category: call.category,
            questions: call.category.split(', '),
            called: call.call_status,
            response: call.response
          })));
        }
      } catch (err) {
        console.error('Error fetching call schedule:', err);
        setError('Failed to fetch call schedule');
      }
    };

    fetchCallSchedule();
  }, [hospitalizations]);

  const handleAdmission = async (e) => {
    e.preventDefault();
    
    try {
      // Add validations for required fields
      if (!admissionData.diagnosis || !admissionData.admitDate) {
        throw new Error('Diagnosis and Admit Date are required');
      }

      const response = await fetch('http://localhost:5003/api/medical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,          // Using the patientId from URL params
          diagnosis: admissionData.diagnosis,
          allergies: admissionData.allergies || 'None',
          admit_date: admissionData.admitDate,
          discharge_instructions: '',      // Empty initially as per schema
          follow_up_app_date: ''          // Empty initially as per schema
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add medical record');
      }

      const result = await response.json();

      // Transform the response to match the UI state structure
      const newHospitalization = {
        id: result.medicalRecord.hospitalization_id,
        diagnosis: result.medicalRecord.diagnosis,
        allergies: result.medicalRecord.allergies,
        admitDate: result.medicalRecord.admit_date,
        dischargeDate: null,
        dischargeInstructions: null,
        followUpDate: null
      };

      // Update the UI state
      setHospitalizations(prev => [...prev, newHospitalization]);
      
      // Reset the form
      setAdmissionData({ 
        diagnosis: "", 
        allergies: "", 
        admitDate: "" 
      });

    } catch (err) {
      console.error('Error adding medical record:', err);
      setError('Failed to add medical record. Please try again.');
    }
  };

  const handleDischarge = async (e) => {
    e.preventDefault();
    try {
      // Update validation to include followUpDate
      if (!dischargeData.hospitalizationId || !dischargeData.dischargeDate || 
          !dischargeData.dischargeInstructions || !dischargeData.followUpDate) {
        throw new Error('All discharge fields are required');
      }

      const response = await fetch(`http://localhost:5003/api/medical/${dischargeData.hospitalizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discharge_date: dischargeData.dischargeDate,
          discharge_instructions: dischargeData.dischargeInstructions,
          follow_up_app_date: dischargeData.followUpDate // Add this field
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update discharge information');
      }

      const result = await response.json();

      // Update the UI with new data including follow-up date
      setHospitalizations(hospitalizations.map(hosp => 
        hosp.id === dischargeData.hospitalizationId
          ? {
              ...hosp,
              dischargeDate: result.medicalRecord.discharge_date,
              dischargeInstructions: result.medicalRecord.discharge_instructions,
              followUpDate: result.medicalRecord.follow_up_app_date
            }
          : hosp
      ));

      // Reset the form including follow-up date
      setDischargeData({
        hospitalizationId: "",
        dischargeDate: "",
        dischargeInstructions: "",
        followUpDate: ""
      });

    } catch (err) {
      console.error('Error processing discharge:', err);
      setError('Failed to process discharge. Please try again.');
    }
  };

  const handleCallStatusUpdate = async (callId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5003/api/discharge-calls/${callId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_status: newStatus,
          response: '' // Maintain empty response when just updating status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update call status');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state only after successful backend update
        setCallSchedule(callSchedule.map(call => 
          call.id === callId 
            ? { 
                ...call, 
                called: result.call.call_status,
                response: result.call.response
              } 
            : call
        ));
      }
    } catch (err) {
      console.error('Error updating call status:', err);
      setError('Failed to update call status');
    }
  };

  const handleViewReport = async (callReportId) => {
    try {
      const response = await fetch(`http://localhost:5003/api/discharge-calls/report/${callReportId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch call report');
      }
      
      const result = await response.json();
      if (result.success) {
        const call = result.call;
        const hosp = hospitalizations.find(h => h.id === call.hospitalization_id);
        
        // You can show this information in a modal or alert for now
        alert(`
          Report ID: ${call.call_report_id}
          Hospitalization: ${hosp ? `${hosp.diagnosis} (${hosp.admitDate})` : 'N/A'}
          Call Date: ${call.call_date}
          Status: ${call.call_status ? 'Completed' : 'Pending'}
          Questions: ${call.category}
          Response: ${call.response || 'No response recorded'}
        `);
      }
    } catch (err) {
      console.error('Error fetching call report:', err);
      setError('Failed to fetch call report');
    }
  };

  const handleScheduleCall = async (e) => {
    e.preventDefault();
    try {
      if (!newCall.hospitalizationId || !newCall.callDate || !newCall.callTime || newCall.questions.length === 0) {
        setError('Please fill in all required fields');
        return;
      }

      // Combine date and time in the required format
      const combinedDateTime = `${newCall.callDate} ${newCall.callTime}`;

      const response = await fetch('http://localhost:5003/api/discharge-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalization_id: newCall.hospitalizationId,
          call_date: combinedDateTime, // Send combined date and time
          category: newCall.questions.join(', '),
          call_status: false,
          response: ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule call');
      }

      const result = await response.json();
      
      if (result.success) {
        // Add new call to the schedule with the generated call_report_id
        setCallSchedule(prev => [...prev, {
          id: result.call.call_report_id,
          hospitalizationId: result.call.hospitalization_id,
          callDate: result.call.call_date,
          category: result.call.category,
          questions: result.call.category.split(', '), // Split back into array for display
          called: result.call.call_status,
          response: result.call.response
        }]);

        // Reset form
        setNewCall({
          hospitalizationId: '',
          callDate: '',
          callTime: '', // Reset time as well
          questions: [],
          called: false
        });

        setError(null);
      }
    } catch (err) {
      console.error('Error scheduling call:', err);
      setError(err.message || 'Failed to schedule call');
    }
  };

  const activeHospitalizations = hospitalizations.filter(h => !h.dischargeDate);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <div className="w-3/4 text-center">
          Loading patient data...
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
    <>
    <Navbar />
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Patient Profile</h1>

        {/* Personal Details Section */}
        <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Personal Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <div className="text-sm text-gray-700 p-3 bg-[#e1f9e1] border border-[#1adb5d] rounded-lg">
                  {patientData.firstName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <div className="text-sm text-gray-700 p-3 bg-[#e1f9e1] border border-[#1adb5d] rounded-lg">
                  {patientData.lastName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <div className="text-sm text-gray-700 p-3 bg-[#e1f9e1] border border-[#1adb5d] rounded-lg">
                  {patientData.dateOfBirth}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="text-sm text-gray-700 p-3 bg-[#e1f9e1] border border-[#1adb5d] rounded-lg capitalize">
                  {patientData.gender}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="text-sm text-gray-700 p-3 bg-[#e1f9e1] border border-[#1adb5d] rounded-lg">
                  {patientData.phoneNumber}
                </div>
            </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
      <div className="text-sm text-gray-700 p-3 bg-[#e1f9e1] border border-[#1adb5d] rounded-lg">
        {patientData.email}
      </div>
    </div>
  </div>
        </div>


        {/* Hospitalization History Table */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hospitalization History</h2>
          
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#20cc5c] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Allergies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Admit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Discharge Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Instructions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Follow-up Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitalizations.map((entry) => (
                  <tr key={entry.id} className="odd:bg-white even:bg-[#e1f9e1] hover:bg-[#b2f5b2]">
                    <td className="px-6 py-4 text-sm text-gray-800">{entry.id}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">{entry.diagnosis}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">{entry.allergies}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{entry.admitDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{entry.dischargeDate || 'Not discharged'}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">{entry.dischargeInstructions || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{entry.followUpDate || 'Not scheduled'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  

          {/* Admission Form */}
          <form onSubmit={handleAdmission} className="mt-8 space-y-4 border-t pt-6">
            <h3 className="text-xl font-medium text-gray-700 mb-4">New Admission</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <input
                  type="text"
                  value={admissionData.diagnosis}
                  onChange={(e) => setAdmissionData({
                    ...admissionData,
                    diagnosis: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                <input
                  type="text"
                  value={admissionData.allergies}
                  onChange={(e) => setAdmissionData({
                    ...admissionData,
                    allergies: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admit Date</label>
                <input
                  type="date"
                  value={admissionData.admitDate}
                  onChange={(e) => setAdmissionData({
                    ...admissionData,
                    admitDate: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#1adb5d] text-white rounded-lg hover:bg-[#149c47] focus:outline-none focus:ring-2 focus:ring-[#1adb5d] focus:ring-offset-2"
              >
                Add Admission
              </button>
            </div>
        </form>


          {/* Discharge Form */}
          <form onSubmit={handleDischarge} className="mt-8 space-y-4 border-t pt-6">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Process Discharge</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Hospitalization</label>
                <select
                  value={dischargeData.hospitalizationId}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    hospitalizationId: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                  required
                >
                  <option value="">Select admission</option>
                  {activeHospitalizations.map(hosp => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.admitDate} - {hosp.diagnosis}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date</label>
                <input
                  type="date"
                  value={dischargeData.dischargeDate}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    dischargeDate: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={dischargeData.followUpDate}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    followUpDate: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Instructions</label>
                <textarea
                  value={dischargeData.dischargeInstructions}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    dischargeInstructions: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#1adb5d] text-white rounded-lg hover:bg-[#149c47] focus:outline-none focus:ring-2 focus:ring-[#1adb5d] focus:ring-offset-2"
              >
                Process Discharge
              </button>
            </div>
        </form>

        </div>

        {/* Call Schedule Section */}
        <div className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Post-Discharge Call Schedule</h2>
          
          {/* Call Schedule History Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#20cc5c] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Report ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Call Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Hospitalization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callSchedule.map((call) => {
                  const hosp = hospitalizations.find(h => h.id === call.hospitalizationId);
                  return (
                    <tr key={call.id} className="odd:bg-white even:bg-[#e1f9e1] hover:bg-[#b2f5b2]">
                      <td className="px-6 py-4 text-sm text-gray-800">{call.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{call.callDate}</td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">
                        {hosp ? `${hosp.admitDate} - ${hosp.diagnosis}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">
                        {call.questions.map(q => 
                          questionOptions.find(opt => opt.value === q)?.label
                        ).join(", ")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleCallStatusUpdate(call.id, !call.called)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            call.called 
                              ? 'bg-[#1adb5d] text-white hover:bg-[#149c47]' 
                              : 'bg-[#fcd34d] text-[#6b5300] hover:bg-[#d99e24]'
                          }`}
                        >
                          {call.called ? 'Completed' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewReport(call.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs font-medium"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


          {/* Schedule New Call Form */}
          <form onSubmit={handleScheduleCall} className="space-y-4">
              <h3 className="text-xl font-medium text-gray-700 mb-4">Schedule New Call</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Hospitalization</label>
                  <select
                    value={newCall.hospitalizationId}
                    onChange={(e) => setNewCall({
                      ...newCall,
                      hospitalizationId: e.target.value // Don't use parseInt since we need string
                    })}
                    className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                    required
                  >
                    <option value="">Select hospitalization</option>
                    {hospitalizations.map(hosp => (
                      <option key={hosp.id} value={hosp.id}>
                        {hosp.admitDate} - {hosp.diagnosis}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Date</label>
                  <input
                    type="date"
                    value={newCall.callDate}
                    onChange={(e) => setNewCall({
                      ...newCall,
                      callDate: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Time (24-hour)</label>
                  <input
                    type="time"
                    value={newCall.callTime}
                    onChange={(e) => setNewCall({
                      ...newCall,
                      callTime: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Questions</label>
                  <select
                    multiple
                    value={newCall.questions}
                    onChange={(e) => setNewCall({
                      ...newCall,
                      questions: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="w-full px-4 py-2 border border-[#1adb5d] bg-[#e1f9e1] text-gray-700 rounded-lg focus:ring-2 focus:ring-[#1adb5d] focus:border-[#149c47]"
                    required
                  >
                    {questionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1adb5d] text-white rounded-lg hover:bg-[#149c47] focus:outline-none focus:ring-2 focus:ring-[#1adb5d] focus:ring-offset-2"
                >
                  Schedule Call
                </button>
              </div>
            </form>

        </div>
      </div>
    </div>
    </>
  );
};

export default PatientProfile;