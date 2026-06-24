import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. ഒന്നാമതായി ബോട്ട്സ്ട്രാപ്പ് സി.എസ്.എസ് ഇമ്പോർട്ട് ചെയ്യുക
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. അതിനു ശേഷം മാത്രം നമ്മുടെ കസ്റ്റം സ്റ്റൈലുകൾ ഇമ്പോർട്ട് ചെയ്യുക
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)