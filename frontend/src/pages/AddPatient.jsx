import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPatient } from "../services/api";

function AddPatient(){

 const navigate = useNavigate();

 const [form,setForm] = useState({
  name:"",
  age:"",
  roomNumber:"",
  bedNumber:"",
  diagnosis:"",
  status:"",
  medication:"",
  notes:""
 });

 const handleChange=(e)=>{
  setForm({
   ...form,
   [e.target.name]:e.target.value
  })
 }

 const submit=async(e)=>{

  e.preventDefault();

  for(let key in form){
   if(form[key]===""){
    alert("All fields required");
    return;
   }
  }

  await addPatient(form);

  alert("Patient Added");

  navigate("/dashboard")

 }

 return(

  <div style={{padding:"40px"}}>

   <h2>Add Patient</h2>

   <form onSubmit={submit}>

    <input name="name" placeholder="Name" onChange={handleChange}/><br/>

    <input name="age" placeholder="Age" onChange={handleChange}/><br/>

    <input name="roomNumber" placeholder="Room Number" onChange={handleChange}/><br/>

    <input name="bedNumber" placeholder="Bed Number" onChange={handleChange}/><br/>

    <input name="diagnosis" placeholder="Diagnosis" onChange={handleChange}/><br/>

    <input name="status" placeholder="Status (critical/stable)" onChange={handleChange}/><br/>

    <input name="medication" placeholder="Medication / tablets" onChange={handleChange}/><br/>

    <textarea name="notes" placeholder="Doctor notes" onChange={handleChange}></textarea><br/>

    <button>Add Patient</button>

   </form>

  </div>

 )

}

export default AddPatient