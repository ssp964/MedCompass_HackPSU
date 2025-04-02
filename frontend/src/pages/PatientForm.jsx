import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PatientForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    preferredTime: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5003/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add patient');
      }

      const data = await response.json();
      console.log("Patient added successfully:", data);
      navigate(`/profile/${data.patient.patient_id}`);
    } catch (err) {
      setError("Failed to add patient. Please try again.");
      console.error("Error adding patient:", err);
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex justify-center pt-20">
      <form onSubmit={handleSubmit} className="w-full max-w-3/4 p-6 shadow-md rounded-lg">
        <h2 className="text-2xl text-center font-semibold mb-8">Patient Details</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              First Name
            </label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]" 
              required 
            />
          </div>
          
          <div className="w-full md:w-1/2 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Last Name
            </label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]" 
              required 
            />
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Date of Birth
            </label>
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]" 
              required 
            />
          </div>

          <div className="w-full md:w-1/2 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="gender">
              Gender
            </label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]" 
              required 
            />
          </div>

          <div className="w-full md:w-1/2 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]" 
              required 
            />
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Preferred Time to Call
            </label>
            <select 
              name="preferredTime" 
              value={formData.preferredTime} 
              onChange={handleChange} 
              className="appearance-none block w-full bg-[#e1f9e1] text-gray-700 border border-[#1adb5d] rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#149c47]"
            >
              <option value="">Select Time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            type="submit" 
            className="bg-[#1adb5d] text-white px-10 py-2 rounded-md hover:bg-[#149c47]"
          >
            Add Patient
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default PatientForm;
