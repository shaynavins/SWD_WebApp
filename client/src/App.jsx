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
import Subscribe from './pages/Subscribe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


function App() {

  return (
    <QueryClientProvider client={queryClient}>
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/poster" element={<Poster />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/subscribe" element={<Subscribe />} />

        </Routes>
      </BrowserRouter>
      
    </>
    </QueryClientProvider>
  )
}

export default App
