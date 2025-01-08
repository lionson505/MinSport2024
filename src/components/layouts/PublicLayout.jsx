import { Link } from 'react-router-dom';
import HeaderTwo from '../../components/headerTwo';

function PublicLayout({ children }) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderTwo />

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-12">
        {children}
      </main>

      {/* Footer */}
      {/* <footer className="bg-white border-t">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-8">
            {/* Add footer content  </div>  
            </div>
      </footer> */}
    </div>
  );
}

export default PublicLayout; 