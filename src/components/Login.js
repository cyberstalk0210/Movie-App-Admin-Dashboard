import React, { useState } from 'react';
import { login } from '../services/api';
import { useHistory } from 'react-router-dom';
import image from '../assets/image/image.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            history.push('/movies');
        } catch (err) {
            setError(err || 'Login yoki parol noto‘g‘ri');
            console.error('Frontend login xatosi:', err);
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
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your email"
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
                    <div className="flex items-center text-gray-400">
                        <input type="checkbox" id="remember" className="mr-2" />
                        <label htmlFor="remember">Remember me</label>
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-600 rounded text-white hover:bg-blue-800">
                        SIGN IN
                    </button>
                    {/* <div className="text-center text-gray-400 my-4">or</div>
                    <div className="flex justify-between space-x-2">
                        <button className="w-1/2 py-2 bg-blue-700 rounded text-white text-xl">f</button>
                        <button className="w-1/2 py-2 bg-red-600 rounded text-white text-xl">G</button>
                    </div> */}
                    <div className="text-center space-y-2">
                        <a href="/register" className="block text-blue-400 hover:underline">Don't have an account? Sign up</a>
                        <a href="/forgot-password" className="block text-blue-400 hover:underline">Forgot password?</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;