const Fallback = ({ message, onRetry }) => {
    return (
      <div className="flex w-full border-2 border-red-400 justify-center items-center min-h-[300px] bg-gray-50 rounded-lg shadow-lg p-6">
        <div className="text-center mx-auto space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m2 0a2 2 0 11-4 0m4 0a2 2 0 11-4 0M15 12H9m6 0a6 6 0 01-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
  
          {/* Message */}
          <h1 className="text-2xl font-semibold text-gray-700">
            {message || "No Data Available"}
          </h1>
          <p className="text-gray-500">
            It seems there's nothing to display here. Please check back later or try again.
          </p>
  
          {/* Action Button */}
          {onRetry && (
            <button
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  };
  
  export default Fallback;
  