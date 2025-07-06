import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ userName = "User Name" }) => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutOpen(true);
  };

  const confirmLogout = () => {
    // Replace with actual logout logic (e.g., clear token, redirect to login)
    console.log("Logging out...");
    setIsLogoutOpen(false);
    // Example: window.location.href = "/login";
  };

  const cancelLogout = () => {
    setIsLogoutOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-[#1c1e2c] text-white p-6 flex flex-col shadow-lg">
      {/* Profile Name */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-100">{userName}</h2>
        <div className="h-px bg-gray-600 mt-2"></div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col space-y-4">
        <Link
          to="/create/series"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out"
        >
          Criteria yaratish
        </Link>
        <Link
          to="/movies"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out"
        >
          Episode qo‘shish
        </Link>
        
        <Link
          to="/videolist"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out"
        >
          Videolar ro‘yxati
        </Link>
        <button
          onClick={handleLogoutClick}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out"
        >
          Profildan chiqish
        </button>
      </div>

      {/* Logout Confirmation Popup */}
      {isLogoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1c1e2c] p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-4">
              Rostan profildan chiqmoqchimisiz?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Yo‘q
              </button>
              <button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Ha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;