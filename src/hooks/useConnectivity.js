import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to detect online/offline connectivity.
 * Uses navigator.onLine + event listeners for real-time detection.
 * 
 * When connection drops:
 * - Returns isOnline = false
 * - Calls onDisconnect callback (if provided)
 * 
 * When connection restores:
 * - Returns isOnline = true
 * - Calls onReconnect callback (if provided)
 */
export function useConnectivity({ onDisconnect, onReconnect } = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    if (wasOffline && onReconnect) {
      onReconnect()
    }
    setWasOffline(false)
  }, [wasOffline, onReconnect])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setWasOffline(true)
    if (onDisconnect) {
      onDisconnect()
    }
  }, [onDisconnect])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, wasOffline }
}
