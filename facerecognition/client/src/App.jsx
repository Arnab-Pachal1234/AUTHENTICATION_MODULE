import React, { useState } from 'react';
import FaceAuth from './components/faceAuth'; // Adjust path if necessary

function App() {
    const [isLoginMode, setIsLoginMode] = useState(false);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Switch to {isLoginMode ? 'Registration Mode' : 'Login Mode'}
                </button>
            </div>
            
            <hr />
            
            {/* Pass the state as a prop to your component */}
            <FaceAuth isLoginMode={isLoginMode} />
        </div>
    );
}

export default App;