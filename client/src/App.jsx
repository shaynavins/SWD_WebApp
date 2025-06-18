import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Poster from './pages/Poster';
import Viewer from './pages/Viewer';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/poster" element={<Poster />} />
          <Route path="/viewer" element={<Viewer />} />
        </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App
