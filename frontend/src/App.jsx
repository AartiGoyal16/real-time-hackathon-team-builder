import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/chat/:teamId" element={<Chat/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;