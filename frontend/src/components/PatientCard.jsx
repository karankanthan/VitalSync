import { useNavigate } from "react-router-dom";
import { deletePatient } from "../services/api";

function PatientCard({patient,refresh}){

 const navigate = useNavigate();

 const remove = async()=>{

  await deletePatient(patient._id);
  refresh();

 }

 return(

  <div style={{
   border:"1px solid #ccc",
   padding:"15px",
   marginBottom:"15px"
  }}>

   <h3>{patient.name}</h3>

   <p>Age: {patient.age}</p>

   <p>Room: {patient.roomNumber}</p>

   <p>Bed: {patient.bedNumber}</p>

   <p>Status: {patient.status}</p>

   <p>Diagnosis: {patient.diagnosis}</p>

   <p>Medication: {patient.medication}</p>

   <p>Notes: {patient.notes}</p>

   <button onClick={()=>navigate(`/update/${patient._id}`)}>
    Update
   </button>

   <button onClick={remove}>
    Delete
   </button>

  </div>

 )

}

export default PatientCard