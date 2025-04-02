// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with specific database and app name
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected to my_database"))
.catch(err => console.log("MongoDB connection error:", err));

// Use existing collection without schema validation
const Patient = mongoose.model('patients', new mongoose.Schema({}, { 
  strict: false,
  collection: 'patients' 
}));

const MedicalData = mongoose.model('medical_data', new mongoose.Schema({}, { 
  strict: false,
  collection: 'medical_data' 
}));

const DischargeCall = mongoose.model('post_discharge_calls', new mongoose.Schema({}, { 
  strict: false,
  collection: 'post_discharge_calls' 
}));

// API endpoint to add a new patient
app.post('/api/patients', async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    const patientId = `P${(count + 1).toString().padStart(4, '0')}`;

    const patient = new Patient({
      patient_id: patientId,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      dob: req.body.dob,
      phone: req.body.phone,
      gender: req.body.gender,
      email: req.body.email,
      address: '', // Required by existing schema
      preferred_call_time: req.body.preferredTime
    });

    await patient.save();
    res.status(201).json({ success: true, patient });
  } catch (error) {
    console.error('Error saving patient:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to fetch all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to fetch a specific patient by ID
app.get('/api/patients/:patientId', async (req, res) => {
  try {
    console.log('Searching for patient:', req.params.patientId);
    const patient = await Patient.findOne({ patient_id: req.params.patientId });
    console.log('Found patient:', patient);
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: `Patient with ID ${req.params.patientId} not found` 
      });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to fetch all medical records
app.get('/api/medical/:patientId', async (req, res) => {
  try {
    const records = await MedicalData.find({ patient_id: req.params.patientId });
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to add new medical record
app.post('/api/medical', async (req, res) => {
  try {
    // Generate unique hospitalization ID
    const count = await MedicalData.countDocuments();
    const hospitalizationId = `H${(count + 1).toString().padStart(4, '0')}`;

    const medicalRecord = new MedicalData({
      patient_id: req.body.patient_id,
      hospitalization_id: hospitalizationId,
      diagnosis: req.body.diagnosis,
      allergies: req.body.allergies,
      admit_date: req.body.admit_date,
      discharge_instructions: req.body.discharge_instructions || '',
      follow_up_app_date: req.body.follow_up_app_date || '', // Ensure this field is handled
      discharge_date: null // Add this to track discharge status
    });

    await medicalRecord.save();
    res.status(201).json({ success: true, medicalRecord });
  } catch (error) {
    console.error('Error adding medical record:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to update medical record (for discharge)
app.put('/api/medical/:hospitalizationId', async (req, res) => {
  try {
    // Validate required fields for discharge
    if (!req.body.discharge_date || !req.body.discharge_instructions || !req.body.follow_up_app_date) {
      return res.status(400).json({
        success: false,
        message: 'Discharge date, instructions, and follow-up date are required'
      });
    }

    const medicalRecord = await MedicalData.findOneAndUpdate(
      { hospitalization_id: req.params.hospitalizationId },
      { 
        $set: {
          discharge_date: req.body.discharge_date,
          discharge_instructions: req.body.discharge_instructions,
          follow_up_app_date: req.body.follow_up_app_date // Ensure follow-up date is updated
        }
      },
      { new: true }
    );

    if (!medicalRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medical record not found' 
      });
    }

    res.status(200).json({ success: true, medicalRecord });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule new discharge call
app.post('/api/discharge-calls', async (req, res) => {
  try {
    // Generate unique call report ID
    const count = await DischargeCall.countDocuments();
    const callReportId = `R${(count + 1).toString().padStart(4, '0')}`;

    const call = new DischargeCall({
      call_report_id: callReportId,
      hospitalization_id: req.body.hospitalization_id,
      call_date: req.body.call_date,
      call_status: false, // Initially set to false (pending)
      category: req.body.category,
      response: req.body.response || ''
    });

    await call.save();
    res.status(201).json({ success: true, call });
  } catch (error) {
    console.error('Error scheduling call:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get calls for a specific hospitalization
app.get('/api/discharge-calls/:hospitalizationId', async (req, res) => {
  try {
    const calls = await DischargeCall.find({ 
      hospitalization_id: req.params.hospitalizationId 
    });
    res.status(200).json({ success: true, calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update call status
app.put('/api/discharge-calls/:callReportId', async (req, res) => {
  try {
    const call = await DischargeCall.findOneAndUpdate(
      { call_report_id: req.params.callReportId },
      { 
        $set: { 
          call_status: req.body.call_status,
          response: req.body.response || ''
        } 
      },
      { new: true }
    );

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call record not found'
      });
    }

    res.status(200).json({ success: true, call });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific call report
app.get('/api/discharge-calls/report/:callReportId', async (req, res) => {
  try {
    const call = await DischargeCall.findOne({ 
      call_report_id: req.params.callReportId 
    });
    
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call report not found'
      });
    }

    res.status(200).json({ success: true, call });
  } catch (error) {
    console.error('Error fetching call report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add this endpoint for searching calls by hospitalization IDs
app.post('/api/discharge-calls/search', async (req, res) => {
  try {
    const { hospitalizationIds } = req.body;
    
    if (!Array.isArray(hospitalizationIds) || hospitalizationIds.length === 0) {
      return res.status(200).json({
        success: true,
        calls: [],
        message: 'No hospitalizations provided'
      });
    }

    const calls = await DischargeCall.find({
      hospitalization_id: { $in: hospitalizationIds }
    }).sort({ call_date: -1 });

    res.status(200).json({
      success: true,
      calls: calls || []
    });
  } catch (error) {
    console.error('Error searching calls:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});