import React from 'react';
 
 const ScriptReport = () => {
   const reportData = {
     reportId: "REP123456",
     patientName: "John Doe",
     hospitalizationReason: "Post-surgery recovery - Hip replacement",
     dischargeDate: "2025-03-25",
     questions: [
       {
         question: "How would you rate your pain level today?",
         response: "Mild pain, manageable with prescribed medication"
       },
       {
         question: "Are you able to perform basic movements as instructed?",
         response: "Yes, can perform most movements with minimal assistance"
       },
       {
         question: "Have you experienced any unusual symptoms?",
         response: "No unusual symptoms reported"
       }
     ]
   };
 
   return (
     <div className="p-8 max-w-7xl mx-auto">
       <div className="bg-white rounded-xl p-8 shadow-lg">
         <h1 className="text-3xl font-bold text-gray-800 mb-8">Script Report</h1>
 
         <div className="grid md:grid-cols-2 gap-8 mb-8">
           <div className="space-y-6">
             <div>
               <label className="text-sm text-[#1adb5d] block mb-2">Report ID</label>
               <span className="text-lg text-gray-800 font-medium">{reportData.reportId}</span>
             </div>
             <div>
               <label className="text-sm text-[#1adb5d] block mb-2">Patient Name</label>
               <span className="text-lg text-gray-800 font-medium">{reportData.patientName}</span>
             </div>
           </div>
           <div className="space-y-6">
             <div>
               <label className="text-sm text-[#1adb5d] block mb-2">Hospitalization Reason</label>
               <span className="text-lg text-gray-800 font-medium">{reportData.hospitalizationReason}</span>
             </div>
             <div>
               <label className="text-sm text-[#1adb5d] block mb-2">Discharge Date</label>
               <span className="text-lg text-gray-800 font-medium">{reportData.dischargeDate}</span>
             </div>
           </div>
         </div>
 
         <div className="h-px bg-[#1adb5d] my-8"></div>
 
         <h2 className="text-2xl font-semibold text-gray-800 mb-6">Patient Responses</h2>
 
         <div className="space-y-4">
           {reportData.questions.map((item, index) => (
             <div key={index} className="bg-[#e1f9e1] rounded-lg p-6 border border-[#1adb5d]">
               <h3 className="text-lg font-medium text-gray-800 mb-2">
                 Question {index + 1}:
               </h3>
               <p className="text-gray-700 mb-4">{item.question}</p>
               <label className="text-sm text-[#1adb5d] block mb-2">Response:</label>
               <p className="text-gray-700">{item.response}</p>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 };
 
 export default ScriptReport;