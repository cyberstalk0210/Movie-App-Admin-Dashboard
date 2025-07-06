import React, { useState } from 'react';
import { signUp } from '../services/api'; // Updated import
import { useHistory } from 'react-router-dom';
import image from '../assets/image/image.png';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signUp(email, password,username);
            history.push('/login'); // Updated redirect to /series
        } catch (err) {
            setError(err.message || 'Registration failed');
            console.error('Frontend register error:', err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}>
            <div className="bg-black bg-opacity-70 p-8 rounded-lg w-full max-w-md text-white">
                <h2 className="text-3xl mb-6 text-blue-400">Online TV</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className="w-full p-2 bg-gray-800 rounded text-white"
                        />
                    </div>
                        <div>
                        <label className="block text-gray-400 mb-2">User Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                            className="w-full p-2 bg-gray-800 rounded text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="w-full p-2 bg-gray-800 rounded text-white"
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-600 rounded text-white hover:bg-blue-800">
                        Sign Up
                    </button>
                    <div className="text-center space-y-2">
                        <a href="/login" className="block text-blue-400 hover:underline">Already have an account? Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;