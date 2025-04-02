import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/MedCompass.png';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-[#20cc5c] text-white shadow-md sticky top-0 z-50 flex justify-between items-center px-10 py-5">
      <div className="flex justify-start items-center">
        <img src={logo} alt="Logo" className="w-72" />
      </div>

      <div className="flex justify-end items-center space-x- px-10 gap-5">
        <Link
          to="/"
          className="hover:bg-[#149c47] px-5 py-2 rounded-lg transition text-lg border"
        >
          Dashboard
        </Link>

        {location.pathname === "/" && (
          <Link
            to="/addPatient"
            className="hover:bg-[#149c47] px-5 py-2 rounded-lg transition text-lg border"
          >
            Add Patient
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
