import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- CONSTANTS & HELPERS --- //

export const MMK_PER_CREDIT = 100;

export const calculateCreditCost = (price_mmk: number) => price_mmk / MMK_PER_CREDIT;

/**
 * A custom hook to persist state to localStorage and synchronize it across browser tabs in real-time.
 * This simulates a live, centralized database experience.
 * @param key The key to use in localStorage and for the BroadcastChannel.
 * @param initialValue The default value to use if no data is found in localStorage.
 * @returns A stateful value and a function to update it.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            } else {
                window.localStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            }
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Use a ref to hold the broadcast channel instance to keep it stable across re-renders.
    const channel = useRef<BroadcastChannel | null>(null);

    // Initialize BroadcastChannel
    useEffect(() => {
        // Ensure this only runs in a browser environment
        if (typeof BroadcastChannel !== 'undefined') {
            channel.current = new BroadcastChannel(key);

            // Listener for messages from other tabs
            const handleMessage = () => {
                try {
                    const item = window.localStorage.getItem(key);
                    if (item) {
                        const newValue = JSON.parse(item);
                        // Update state only if it has actually changed to prevent loops
                        if (JSON.stringify(state) !== JSON.stringify(newValue)) {
                            setState(newValue);
                        }
                    }
                } catch (error) {
                     console.error(`Error handling broadcast message for key "${key}":`, error);
                }
            };

            channel.current.addEventListener('message', handleMessage);

            // Cleanup on unmount
            return () => {
                channel.current?.removeEventListener('message', handleMessage);
                channel.current?.close();
            };
        }
    }, [key, state]); // Re-run effect if key or state changes to ensure listener has latest state closure

    const setPersistentState = useCallback<React.Dispatch<React.SetStateAction<T>>>((newStateAction) => {
        setState(prevState => {
            const newState = typeof newStateAction === 'function' 
                ? (newStateAction as (prevState: T) => T)(prevState) 
                : newStateAction;
            
            try {
                // Skip localStorage for orders since we use backend now
                if (key === 'app_orders') {
                    return newState;
                }
                
                const newStateJSON = JSON.stringify(newState);
                window.localStorage.setItem(key, newStateJSON);
                // Notify other tabs of the change
                if (channel.current) {
                    channel.current.postMessage('update');
                }
            } catch (error) {
                console.error(`Error writing to localStorage key "${key}":`, error);
            }

            return newState;
        });
    }, [key]);

    return [state, setPersistentState];
}
