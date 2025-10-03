import * as Network from 'expo-network';
import { useState, useEffect } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

export async function checkNetworkStatus(): Promise<NetworkStatus> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected && networkState.isInternetReachable ? 'online' : 'offline';
  } catch (error) {
    console.error('Error checking network status:', error);
    return 'unknown';
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>('unknown');

  useEffect(() => {
    let mounted = true;

    const updateStatus = async () => {
      const newStatus = await checkNetworkStatus();
      if (mounted) {
        setStatus(newStatus);
      }
    };

    updateStatus();

    const interval = setInterval(updateStatus, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}

export function isOnline(status: NetworkStatus): boolean {
  return status === 'online';
}

export function isOffline(status: NetworkStatus): boolean {
  return status === 'offline';
}
