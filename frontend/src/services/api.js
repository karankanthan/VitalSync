import axios from "axios";

const API = axios.create({
 baseURL: "https://vitalsync-backend-necr.onrender.com"
});

export const getPatients = () => API.get("/patients");
export const addPatient = (data) => API.post("/patients", data);
export const updatePatient = (id,data) => API.put(`/patients/${id}`,data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);
