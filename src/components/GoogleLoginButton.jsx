import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { googleLogin } from '../services/api';
import { useHistory } from 'react-router-dom';

const GoogleLoginButton = () => {
  const history = useHistory();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);
    //   console.log('Decoded Google payload:', decoded);

      const response = await googleLogin(credential); // Backendga yuborish
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);

    //   console.log('Google login successful:', response);
      history.push('/movies');
    } catch (error) {
      console.error('Google Login Error:', error);
      alert(`Google login failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="mt-4 flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={(error) => alert(`Google auth failed: ${error.error || 'Unknown error'}`)}
        width="100%"
        shape="pill"
        theme="filled_blue"
        size="large"
      />
    </div>
  );
};

export default GoogleLoginButton;