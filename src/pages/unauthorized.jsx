import React from "react";




const NoPageFound = () => {

  const isVerified = localStorage.getItem('verified');

  if(isVerified){
    return <Navigate to="/pending-activation" />;
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <div className="text-red-500 text-6xl mb-4">
          <i className="fas fa-exclamation-triangle"></i> {/* Optional FontAwesome Icon */}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have the necessary permissions to view this page.
        </p>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NoPageFound;
