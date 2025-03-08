import { Link } from 'react-router-dom';
import HeaderTwo from '../../components/headerTwo';

function PublicLayout({ children }) {

  return (
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <HeaderTwo/>

          {/* Main Content */}
          <main className="container mx-auto pt-24 pb-12"
          >
              {children}
          </main>

          {/* Footer */}
          <footer className="bg-blue-900 text-white">
              <div className="container mx-auto px-6 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Contact Info */}
                      <div>
                          <h3 className="text-2xl font-semibold mb-4">Connect with us</h3>
                          <ul>
                              <li className="mb-2 flex items-center">
                                  <svg
                                      className="w-5 h-5 mr-2 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 8l7.89 5.26c.47.31 1.08.31 1.55 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                  </svg>
                                  <span>info@minisports.gov.rw</span>
                              </li>
                              <li className="mb-2 flex items-center">
                                  <svg
                                      className="w-5 h-5 mr-2 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m4 0h4M7 16h10"
                                      />
                                  </svg>
                                  <span>+250 788 196 300 / 5858</span>
                              </li>
                              <li className="mb-2">
                                  {/*<a href="#" className="hover:underline">*/}
                                  {/*    Contact Us →*/}
                                  {/*</a>*/}
                              </li>
                              <li className="mb-2">
                                  {/*<a href="#" className="hover:underline">*/}
                                  {/*    Check Mail*/}
                                  {/*</a>*/}
                              </li>
                              <li className="mb-2">
                                  {/*<a href="#" className="hover:underline">*/}
                                  {/*    Workflow*/}
                                  {/*</a>*/}
                              </li>
                              <li className="mb-2">
                                  <a href="/appointmentrequest?to=minister" className="hover:underline">
                                      Meet the Minister
                                  </a>
                              </li>
                              <li>
                                  <a href="/appointmentrequest?to=ps" className="hover:underline">
                                      Meet the PS
                                  </a>
                              </li>
                          </ul>
                      </div>
                      {/* Map */}
                      <div className="flex justify-center lg:justify-end">
                          <iframe
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4038.3345549079926!2d30.10952821539446!3d-1.9706160392756115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dcdb4fb7457d25%3A0xa1c5b840d0d9e8d9!2sMinistry%20of%20Sports!5e0!3m2!1sen!2srw!4v1681234567890!5m2!1sen!2srw"
                              width="400"
                              height="300"
                              style={{border: 0}}
                              allowFullScreen=""
                              loading="lazy"
                              className="rounded-lg"
                              title="Ministry of Sports Map"
                          ></iframe>
                      </div>
                  </div>
                  <div className="border-t border-blue-800 mt-8 pt-6 text-center">

                      <p className="text-sm text-blue-300">
                          © 2025 Government of the Republic of Rwanda
                      </p>
                  </div>
              </div>
          </footer>

      </div>
  );
}

export default PublicLayout; 