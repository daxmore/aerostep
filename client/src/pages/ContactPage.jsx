import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
    return (
        <div className="container-custom py-20">
            <h1 className="text-5xl font-bold mb-10 tracking-tight">Contact Us</h1>
            <div className="grid lg:grid-cols-2 gap-16">
                <div>
                    <p className="text-xl text-gray-500 mb-12">
                        Have a question about our sneakers or your order? Our team is ready to help you find your perfect step.
                    </p>
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0057FF]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                <p className="text-gray-500">support@aerostep.com</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0057FF]">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Call Us</h3>
                                <p className="text-gray-500">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0057FF]">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Visit Us</h3>
                                <p className="text-gray-500">123 Sneaker Way, Portland, OR</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-10 rounded-3xl">
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                                <input type="text" className="w-full px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-[#0057FF]" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                                <input type="email" className="w-full px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-[#0057FF]" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Subject</label>
                            <input type="text" className="w-full px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-[#0057FF]" placeholder="Regarding my order" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Message</label>
                            <textarea rows="5" className="w-full px-5 py-4 rounded-xl border-none focus:ring-2 focus:ring-[#0057FF]" placeholder="Tell us more..."></textarea>
                        </div>
                        <button className="w-full py-4 bg-[#0F1720] text-white font-bold rounded-xl hover:bg-[#0057FF] transition-all flex items-center justify-center gap-2">
                            <Send className="w-5 h-5" />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
