import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const NoPageFound = () => {
  const [message, setMessage] = useState("");
  const fullMessage = "If you think this is a mistake, please contact the administrator.";
  const typingSpeed =50;
  const navigate = useNavigate();
  const resetDelay = 2000;

  const startTyping = useCallback(() => {
    let index = 0;
    setMessage(""); // Clear the message first

    const type = () => {
      if (index <= fullMessage.length) {
        setMessage(fullMessage.substring(0, index));
        index++;
        return true;
      }
      return false;
    };

    const typeInterval = setInterval(() => {
      const shouldContinue = type();
      if (!shouldContinue) {
        clearInterval(typeInterval);
        setTimeout(startTyping, resetDelay);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [fullMessage]);

  useEffect(() => {
    const cleanup = startTyping();
    return cleanup;
  }, [startTyping]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Ooops!
            <p className="text-sm">What you are looking for is not here.</p>
          </h1>
          <p className="text-gray-600 mb-6 h-12"> {/* Fixed height to prevent layout shifts */}
            {message}
            <span className="animate-pulse ml-1">|</span>
          </p>
          <button
              onClick={() => navigate(-1)} // Changed to use navigate(-1) to go back
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow transition"
          >
            Go back
          </button>
        </div>
      </div>
  );
};

export default NoPageFound;