import { useState, useEffect, useRef } from 'react';

export const useProctoring = (onCheatAttempt) => {
    const [stream, setStream] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const streamRef = useRef(null);

    // Initialize Camera/Mic
    useEffect(() => {
        const startProctoring = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setStream(mediaStream);
                streamRef.current = mediaStream;
                setIsCameraActive(true);
            } catch (err) {
                console.error("Failed to access camera/microphone:", err);
                // Handle permission denial or errors
                onCheatAttempt("Camera/Microphone access is required for this interview.", 1);
            }
        };

        startProctoring();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Only run once on mount

    // Monitor Tab Switching and Window Focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                incrementWarning("Tab Switched");
            }
        };

        const handleWindowBlur = () => {
            incrementWarning("Window Lost Focus");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, []);

    const incrementWarning = (reason) => {
        setWarnings(prev => {
            const newCount = prev + 1;
            if (onCheatAttempt) {
                onCheatAttempt(reason, newCount);
            }
            return newCount;
        });
    };

    return { stream, isCameraActive, warnings };
};
