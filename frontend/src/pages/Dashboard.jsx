import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPatients } from "../services/api";
import PatientCard from "../components/PatientCard";
import SearchBar from "../components/SearchBar";

function Dashboard(){

 const [patients,setPatients] = useState([]);
 const [search,setSearch] = useState("");

 const navigate = useNavigate();

 const loadPatients = async()=>{
  const res = await getPatients();
  setPatients(res.data);
 }

 useEffect(()=>{
  loadPatients();
 },[])

 const filtered = patients.filter((p)=>{

  const name = p.name?.toLowerCase() || "";
  const bed = p.bedNumber?.toString() || "";
  const query = search.toLowerCase();

  return name.includes(query) || bed.includes(query);

 });

 return(

  <div style={{padding:"40px"}}>

   <h1>VitalSync Dashboard</h1>

   <SearchBar setSearch={setSearch}/>

   <button
    onClick={()=>navigate("/add-patient")}
    style={{
     padding:"8px",
     marginLeft:"10px"
    }}
   >
    Add Patient
   </button>

   <div style={{marginTop:"30px"}}>

   {filtered.map(p=>(

    <PatientCard
     key={p._id}
     patient={p}
     refresh={loadPatients}
    />

   ))}

   </div>

  </div>

 )

}

export default Dashboard