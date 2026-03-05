import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login(){

 const [email,setEmail] = useState("");
 const [password,setPassword] = useState("");

 const navigate = useNavigate();

 const login = async(e)=>{

  e.preventDefault();

  try{

   const res = await axios.post(
    "http://localhost:5000/api/auth/login",
    {email,password}
   );

   localStorage.setItem("token",res.data.token);

   alert("Login Success");

   navigate("/dashboard");

  }catch(err){

   alert("Login Failed");

  }

 }

 return(

  <div className="login-container">

   <h2>Login</h2>

   <form onSubmit={login}>

    <input
     type="email"
     placeholder="Email"
     onChange={(e)=>setEmail(e.target.value)}
    />

    <input
     type="password"
     placeholder="Password"
     onChange={(e)=>setPassword(e.target.value)}
    />

    <button type="submit">
     Login
    </button>

   </form>

  </div>

 )

}

export default Login;