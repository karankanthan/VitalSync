const Patient = require("../models/Patient");

exports.createPatient = async(req,res)=>{

 const patient = new Patient(req.body);

 await patient.save();

 res.json(patient);
};

exports.getPatients = async(req,res)=>{

 const patients = await Patient.find();

 res.json(patients);

};

exports.updatePatient = async(req,res)=>{

 const updated = await Patient.findByIdAndUpdate(
  req.params.id,
  req.body,
  {new:true}
 );

 res.json(updated);

};

exports.deletePatient = async(req,res)=>{

 await Patient.findByIdAndDelete(req.params.id);

 res.json("Patient deleted");

};