function SearchBar({setSearch}){

 return(

  <input
   placeholder="Search by name or bed number"
   onChange={(e)=>setSearch(e.target.value)}
   style={{
    padding:"8px",
    marginBottom:"20px",
    width:"250px"
   }}
  />

 )

}

export default SearchBar