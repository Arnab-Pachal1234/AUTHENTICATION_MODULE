import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceAuth = ({ isLoginMode }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('Initializing models...');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);

    // 1. Load the AI models when the component mounts
    useEffect(() => {
        const loadModels = async () => {
            try {
               
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                await faceapi.nets.faceExpressionNet.loadFromUri('/models');
                setModelsLoaded(true);
                setStatus('Models loaded. Ready to start.');
            } catch (err) {
                setStatus('Error loading face models. Check your /models folder.');
            }
        };
        loadModels();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            setIsCameraOn(true);
            setStatus("Camera on. Waiting for you to smile...");
        } catch (err) {
            setStatus("Camera access denied.");
        }
    };

    // 2. The Liveness Check Loop
    const handleVideoPlay = () => {
        // Run a check every 200 milliseconds
        const interval = setInterval(async () => {
            if (!videoRef.current) return;

            // Detect the face and its expression
            const detection = await faceapi.detectSingleFace(
                videoRef.current, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();

            if (detection) {
                // Check the probability of the "happy" expression (0.0 to 1.0)
                const smileProbability = detection.expressions.happy;
                
                if (smileProbability > 0.8) {
                    clearInterval(interval); // Stop checking once they smile
                    setStatus("Smile detected! Capturing...");
                    captureAndSend(); // Trigger the backend call
                }
            }
        }, 200);
    };

    // 3. Capture and Send (Your existing logic)
    const captureAndSend = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageBase64 = canvas.toDataURL('image/jpeg');
        const endpoint = isLoginMode ? '/api/login' : '/api/register';

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, image_base64: imageBase64 })
            });
            const data = await response.json();
            
            if (response.ok) {
                setStatus(isLoginMode ? `Success! Token: ${data.token}` : "Registered successfully!");
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (err) {
            setStatus("Network error.");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>{isLoginMode ? 'Face Login' : 'Register Face'}</h2>
            
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ display: 'block', margin: '10px auto', padding: '5px' }}
            />

            <div style={{ position: 'relative', display: 'inline-block' }}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    onPlay={handleVideoPlay} // Starts the AI loop when video plays
                    style={{ width: '400px', border: '2px solid #ccc', borderRadius: '8px' }} 
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <br />
            <button 
                onClick={startCamera} 
                disabled={!modelsLoaded || isCameraOn}
                style={{ margin: '15px', padding: '10px 20px', cursor: modelsLoaded ? 'pointer' : 'not-allowed' }}
            >
                {modelsLoaded ? 'Start Camera & Smile to Authenticate' : 'Loading AI...'}
            </button>

            <p style={{ fontSize: '18px' }}>Status: <strong style={{ color: '#007bff' }}>{status}</strong></p>
        </div>
    );
};

export default FaceAuth;