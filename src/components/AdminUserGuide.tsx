import React from 'react';
import { ArrowLeft, BookOpen, User, Store, Tag, MessageSquare, HelpCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENQUIRY_EMAIL } from "../config/appConfig";
import useAuth from "../auth/useAuth";

const AdminUserGuide = () => {
    const navigate = useNavigate();
    const { user } = useAuth();


    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)} // Go back to previous admin page
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <BookOpen className="text-blue-600" size={24} /> Admin User Manual
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">Platform Guide & Documentation</p>
                        </div>
                    </div>
                    <img src="/bqLogo.jpg" alt="Browse Qatar" className="h-10 w-auto opacity-80" />

                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">

                {/* 1. Our Motto */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
                    <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                        🌟 Our Motto
                    </h2>
                    <blockquote className="text-xl md:text-2xl font-light italic border-l-4 border-white/30 pl-4 my-4">
                        "DineSmart, Live Green"
                    </blockquote>
                    <p className="text-blue-50/90 leading-relaxed text-lg">
                        We aim to connect food lovers with the best dining deals while championing sustainability. Our goal is to reduce food waste by promoting "Super Saver" deals and helping businesses thrive responsibly.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* 2. Getting Started */}
                    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                            <User size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h3>
                        <ul className="space-y-3 text-gray-600 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold text-orange-500">1.</span>
                                <div><strong>Log In:</strong> Use the credentials provided by the BrowseQatar team. Partners will recieve an email with their login credentials and security/API key.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-orange-500">2.</span>
                                <div><strong>Reset Password:</strong> Use the "Forgot Password" option on the login screen. A reset link will be sent to your registered email. Click the link to reset your password.<span className="text-red-500 font-medium"> Please check your Spam/Junk folder if it doesn't appear in your Inbox.</span></div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-orange-500">3.</span>
                                <div>Use the temporary password shared earlier when prompted for reset.</div>
                            </li>
                        </ul>
                    </article>

                    {/* 3. Managing Restaurants */}
                    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <Store size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Managing Restaurants</h3>
                        <ul className="space-y-3 text-gray-600 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-500">1.</span>
                                <div><strong>Add New:</strong> Go to the "Restaurants" tab and click "Add New Restaurant". Fill in all details including specific Cuisine types.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-500">2.</span>
                                <div><strong>Logo:</strong> Upload a square logo for best visibility.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-500">3.</span>
                                <div><strong>API Key:</strong> Always ensure your session API Key is entered in the top bar to save changes.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-blue-500">4.</span>
                                <div><strong>Edit/Delete:</strong> Admins and Owners can remove restaurants. Be careful, this also removes all associated offers.</div>
                            </li>
                        </ul>
                    </article>

                    {/* 4. Offers & Content */}
                    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <Tag size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Offers & Content</h3>
                        <ul className="space-y-3 text-gray-600 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold text-green-500">1.</span>
                                <div><strong>Upload:</strong> Select a restaurant first, then click "Add New Offer".</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-green-500">2.</span>
                                <div><strong>Quality:</strong> Use good quality images with size limit around 100KB. Offensive or political content is strictly prohibited and will be banned.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-green-500">3.</span>
                                <div><strong>API Key:</strong> Always ensure your session API Key is entered in the top bar to save changes.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-green-500">4.</span>
                                <div><strong>Inactive Status:</strong> Offers may go to "Inactive" for review or if expired. Check the Inactive tab to delete or reactivate them.</div>
                            </li>
                        </ul>
                    </article>

                    {/* 5. Messages & Communication */}
                    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Communications</h3>
                        <ul className="space-y-3 text-gray-600 text-sm">
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-500">1.</span>
                                <div><strong>Enquiries:</strong> Check the "Messages" tab for user enquiries.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-500">2.</span>
                                <div>All communication with BrowsweQatar will be available in the messages tab for your reference.</div>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-500">3.</span>
                                <div>All messages are confidential. Do not share any information with anyone.</div>
                            </li>
                            {user?.role === 'admin' && (
                                <li className="flex gap-2">
                                    <span className="font-bold text-purple-500">3.</span>
                                    <div><strong>Account Creation:</strong> <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">Admin Only</span> For new partners, use the "Account Created" button on their message to send them a temporary password automatically.</div>
                                </li>
                            )}
                            {user?.role === 'admin' && (<li className="flex gap-2">
                                <span className="font-bold text-purple-500">3.</span>
                                <div><strong>Status:</strong> Mark messages as "Resolved" once handled to keep the inbox clean.</div>
                            </li>
                            )}
                        </ul>
                    </article>
                </div>

                {/* 6. Support Info */}
                <section className="bg-gray-800 rounded-2xl p-8 text-white shadow-lg text-center">
                    <div className="flex justify-center mb-4">
                        <HelpCircle size={48} className="text-yellow-400 opacity-80" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Need Technical Support?</h2>
                    <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                        If you encounter bugs, need account assistance, or have feature requests, please contact the admin team directly.
                    </p>
                    <a href={`mailto:${ENQUIRY_EMAIL}`} className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors">
                        Contact: {ENQUIRY_EMAIL}
                    </a>
                </section>

                <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-200">
                    <p>BrowseQatar Admin Portal • v2.1.0 • {new Date().getFullYear()}</p>
                </div>

            </main>
        </div>
    );
};

export default AdminUserGuide;
