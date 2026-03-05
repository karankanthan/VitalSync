import { useState,useEffect } from "react";
import { updatePatient } from "../services/api";
import { useParams } from "react-router-dom";

function UpdatePatient(){

 const {id} = useParams();

 const [status,setStatus] = useState("");
 const [notes,setNotes] = useState("");

 const submit=async(e)=>{

  e.preventDefault();

  await updatePatient(id,{status,notes});

  alert("Updated");

  window.location="/dashboard"

 }

 return(

  <div style={{padding:"40px"}}>

   <h2>Update Patient</h2>

   <form onSubmit={submit}>

    <input
     placeholder="New Status"
     onChange={(e)=>setStatus(e.target.value)}
    />

    <textarea
     placeholder="Doctor Notes"
     onChange={(e)=>setNotes(e.target.value)}
    />

    <button>Update</button>

   </form>

  </div>

 )

}

export default UpdatePatient