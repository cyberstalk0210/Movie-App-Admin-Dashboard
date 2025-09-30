import React, { useState } from 'react';
import { signUp } from '../services/api'; 
import { useHistory } from 'react-router-dom';
import image from '../assets/image/image.png';
import { Mail, User, Lock, UserPlus } from 'lucide-react'; // Ikonkalarni qo'shamiz

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await signUp(email, password, username);
            const { token, refreshToken } = response;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);

            // Muovaffaqiyatli ro'yxatdan so'ng, foydalanuvchini login sahifasiga yo'naltirish
            history.push('/login'); 
        } catch (err) {
            setError(err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
            console.error('Frontend register error:', err);
        }
    };


    return (
        // Responsive: Kichik ekranlarda ham to'liq qamrab oladi
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center p-4 sm:p-8" 
            style={{ backgroundImage: `url(${image})` }}
        >
            {/* Fonni qorong'u qoplash (overlay) uchun yaxshilangan effekt */}
            <div className="absolute inset-0 bg-black opacity-60 backdrop-blur-sm"></div>

            {/* Asosiy Register Kartasi */}
            <div className="relative bg-[#1c1e2c] p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md text-white border border-gray-700/50 transform transition duration-500 hover:shadow-blue-500/20">
                
                {/* Sarlavha */}
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 tracking-tight">
                        Akkaunt Yaratish
                    </h2>
                    <p className="text-gray-400 mt-2">Online TV xizmatidan foydalanish uchun ro'yxatdan o'ting.</p>
                </div>

                {/* Xatolik xabari */}
                {error && (
                    <div className="p-3 mb-6 bg-red-900/40 border border-red-600 rounded-lg text-red-300 text-center shadow-lg animate-pulse">
                        {error}
                    </div>
                )}
                
                {/* Register Formasi */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email manzilingizni kiriting"
                                className="w-full p-3 pl-10 bg-[#0f111a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Username Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Foydalanuvchi nomi</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="O'zbekcha ismingizni kiriting"
                                className="w-full p-3 pl-10 bg-[#0f111a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 shadow-inner"
                            />
                        </div>
                    </div>
                    
                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Parol</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Kamida 6 xonali parol kiriting"
                                className="w-full p-3 pl-10 bg-[#0f111a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 shadow-inner"
                            />
                        </div>
                    </div>
                    
                    {/* Sign Up Button */}
                    <button 
                        type="submit" 
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 rounded-lg text-white font-semibold text-lg hover:bg-green-700 transition duration-300 ease-in-out shadow-lg shadow-green-500/50 transform hover:scale-[1.01]"
                    >
                        <UserPlus className='w-5 h-5'/>
                        <span>RO'YXATDAN O'TISH</span>
                    </button>
    
                    {/* Login Link */}
                    <div className="text-center pt-2">
                        <p className="text-gray-400 text-sm">
                            Akkauntingiz bormi? 
                            <a href="/login" className="ml-1 text-green-400 hover:text-green-300 font-medium hover:underline transition duration-200">
                                Kirish
                            </a>
                        </p>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default Register;