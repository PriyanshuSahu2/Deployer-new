import { useEffect, useState, useRef } from 'react';
import { getWSTicket } from '@/service/auth';

export const useLogStream = (workspaceId: string, projectId: string, serviceId: string, type: 'runtime' | 'deployment', enabled: boolean = true) => {
  const [logs, setLogs] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !workspaceId || !projectId || !serviceId) {
      return;
    }

    let isMounted = true;

    const connectWithTicket = async () => {
      if (isConnectingRef.current) {
        console.log("useLogStream: Already connecting, skipping...");
        return;
      }
      isConnectingRef.current = true;
      console.log(`useLogStream: Starting connection for ${type} logs...`);

      try {
        const response = await getWSTicket();
        const ticket = response.data.ticket;

        if (!isMounted) {
          console.log("useLogStream: Component unmounted during ticket fetch");
          isConnectingRef.current = false;
          return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/^https?:\/\//, '') || 'localhost:8080';
        const url = `${protocol}//${host}/workspaces/${workspaceId}/projects/${projectId}/services/${serviceId}/stream?type=${type}&ticket=${ticket}`;

        console.log(`useLogStream: Connecting to WebSocket: ${url}`);
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("useLogStream: WebSocket connected successfully");
          isConnectingRef.current = false;
          if (!isMounted) return;
          setIsConnected(true);
          setError(null);
          setLogs('');
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.log) {
              setLogs((prev) => prev + data.log + '\n');
            }
          } catch (e) {
            console.error("useLogStream: Failed to parse log message", e);
          }
        };

        socket.onerror = (event) => {
          console.error("useLogStream: WebSocket error", event);
          isConnectingRef.current = false;
          if (!isMounted) return;
          setError("Connection error. Reconnecting...");
        };

        socket.onclose = (event) => {
          console.log(`useLogStream: WebSocket closed with code ${event.code}`);
          isConnectingRef.current = false;
          if (!isMounted) return;
          setIsConnected(false);
          if (event.code !== 1000) {
            console.log("useLogStream: Reconnecting in 5s...");
            setTimeout(() => {
              if (isMounted) connectWithTicket();
            }, 5000);
          }
        };
      } catch (err) {
        console.error("useLogStream: Failed to get WS ticket", err);
        isConnectingRef.current = false;
        if (!isMounted) return;
        setError("Failed to authenticate log stream. Retrying...");
        setTimeout(() => {
          if (isMounted) connectWithTicket();
        }, 10000);
      }
    };

    connectWithTicket();

    return () => {
      console.log("useLogStream: Cleaning up connection...");
      isMounted = false;
      isConnectingRef.current = false;
      if (socketRef.current) {
        socketRef.current.close(1000);
      }
    };
  }, [workspaceId, projectId, serviceId, type, enabled]);

  return { logs, isConnected, error };
};
