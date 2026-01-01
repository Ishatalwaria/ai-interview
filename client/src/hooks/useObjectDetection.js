import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

const useObjectDetection = ({ videoRef, onPhoneDetected }) => {
    const [model, setModel] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const detectionIntervalRef = useRef(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                console.log('📦 Object Detection Model Loaded');
            } catch (err) {
                console.error('Failed to load object detection model:', err);
            }
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (model && videoRef.current && !isDetecting) {
            startDetection();
        }
        return () => stopDetection();
    }, [model, videoRef]);

    const startDetection = () => {
        setIsDetecting(true);
        detectionIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const predictions = await model.detect(videoRef.current);

                    const phonePrediction = predictions.find(
                        (p) => p.class === 'cell phone' && p.score > 0.6
                    );

                    if (phonePrediction) {
                        console.warn('📱 Phone Detected!', phonePrediction);
                        if (onPhoneDetected) onPhoneDetected();
                    }
                } catch (err) {
                    // console.warn("Detection frame skipped");
                }
            }
        }, 1000); // Check every second to save resources
    };

    const stopDetection = () => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        setIsDetecting(false);
    };

    return { isDetecting };
};

export default useObjectDetection;
