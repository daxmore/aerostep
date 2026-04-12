import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import logo from '../assets/images/brand_logo/footer_logo.png';

const Footer = () => {
    return (
        <footer className="bg-[#0F1720] text-white">
            <div className="container-custom py-16">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="mb-4">
                            <img 
                                src={logo} 
                                alt="AeroStep Logo" 
                                className="h-8 w-auto object-contain brightness-0 invert"
                            />
                        </div>
                        <p className="text-gray-400 text-sm">
                            Performance footwear engineered for athletes who demand excellence.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-heading font-semibold mb-4 text-[#0057FF] uppercase tracking-wider text-xs">Explore</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">
                                    All Collection
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                                    About AeroStep
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop?category=Running" className="text-gray-400 hover:text-white transition-colors">
                                    Running
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop?category=Training" className="text-gray-400 hover:text-white transition-colors">
                                    Training
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-heading font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors">
                                    Returns
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-heading font-semibold mb-4">Follow Us</h4>
                        <div className="flex gap-4">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div>© 2024 AeroStep. All rights reserved.</div>
                        <div className="hidden md:block text-gray-600">|</div>
                        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <svg width="40" height="13" viewBox="0 0 1336 430" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Visa Logo"><path d="M507.369 7.60031L332.588 423.495H218.557L132.547 91.592C127.325 71.1489 122.785 63.6595 106.904 55.0468C80.9894 41.0181 38.172 27.8632 0.5 19.6942L3.05875 7.60031H186.614C210.012 7.60031 231.045 23.1338 236.357 50.0053L281.782 290.663L394.047 7.60031H507.369ZM954.17 287.709C954.629 177.942 801.98 171.895 803.03 122.86C803.356 107.937 817.603 92.0705 848.788 88.0207C864.245 86.0028 906.833 84.4633 955.136 106.633L974.083 18.4391C948.127 9.0427 914.732 0 873.18 0C766.554 0 691.515 56.5308 690.883 137.478C690.194 197.351 744.443 230.762 785.313 250.658C827.359 271.031 841.466 284.124 841.307 302.348C841.008 330.246 807.772 342.562 776.712 343.047C722.492 343.879 691.029 328.415 665.949 316.786L646.397 407.899C671.602 419.432 718.125 429.494 766.359 430C879.688 430 953.822 374.17 954.17 287.709ZM1235.73 423.502H1335.5L1248.41 7.60031H1156.32C1135.62 7.60031 1118.15 19.6249 1110.42 38.1125L948.545 423.495H1061.82L1084.31 361.368H1222.71L1235.74 423.495L1235.73 423.502ZM1115.36 276.135L1172.14 119.982L1204.82 276.135H1115.37H1115.36ZM661.506 7.60031L572.304 423.495H464.433L553.67 7.60031H661.506Z"></path></svg>
                            <svg width="25" height="15" viewBox="0 0 41 26" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard Logo">
                                <g fill="none" fillRule="evenodd">
                                    <rect fill="currentColor" opacity="0.5" x="14.856" y="3.205" width="10.974" height="19.72"></rect>
                                    <path d="M15.552 13.066c0-4.001 1.873-7.564 4.79-9.86-2.133-1.68-4.825-2.682-7.75-2.682-6.926 0-12.54 5.615-12.54 13.065 0 6.927 5.614 12.542 12.54 12.542 2.926 0 5.617-1.002 7.75-2.681-2.917-2.296-4.79-5.86-4.79-9.864z" fill="currentColor"></path>
                                    <path d="M40.634 13.066c0 6.927-5.615 12.542-12.541 12.542-2.925 0-5.617-1.002-7.75-2.68 2.917-2.3 4.79-5.864 4.79-9.865 0-4-1.873-7.564-4.79-9.86 2.133-1.678 4.825-2.68 7.75-2.68 6.926 0 12.54 5.614 12.54 13.064" fill="currentColor"></path>
                                </g>
                            </svg>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
