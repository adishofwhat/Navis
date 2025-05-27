"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToastProvider } from "@/components/ui/toast-provider";
import Vapi from "@vapi-ai/web";
import AudioVisualizer from "@/components/AudioVisualizer";

type Agent = "shopify" | "whatsapp" | "notion";

interface TranscriptMessage {
  text: string;
  timestamp: string;
  isNew?: boolean;
}

// Define custom interface for the configuration to match the actual API
interface VapiAssistantConfig {
  assistantId?: string;
  tools?: Array<{
    type: string;
    name: string;
    url: string;
    inputParamsSchema: Record<string, any>;
  }>;
  variableValues?: Record<string, string>;
  recordingEnabled?: boolean;
}

// Directly access environment variables - client side only
const VAPI_API_KEY = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_VAPI_API_KEY : null;
const SHOPIFY_ID = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_SHOPIFY : null;
const WHATSAPP_ID = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_WHATSAPP : null;
const NOTION_ID = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_NOTION : null;
const BACKEND_URL = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_URL : null;

// For debugging
if (typeof window !== 'undefined') {
  console.log("Environment variables loaded:", {
    VAPI_API_KEY: VAPI_API_KEY,
    SHOPIFY_ID: SHOPIFY_ID,
    WHATSAPP_ID: WHATSAPP_ID,
    NOTION_ID: NOTION_ID,
    BACKEND_URL: BACKEND_URL
  });
}

const VoiceAgent = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agent, setAgent] = useState<Agent>("shopify");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: string; data?: any }>({ type: "none" });
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToastProvider();

  // Additional state for speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Helper to get formatted timestamp
  const getTimestamp = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Check browser compatibility for required APIs
  const checkBrowserCompatibility = () => {
    const errors = [];
    
    // Check for required browser APIs
    if (!window.MediaRecorder) {
      errors.push("MediaRecorder API is not supported");
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errors.push("MediaDevices API is not supported");
    }
    
    if (!window.WebSocket) {
      errors.push("WebSocket API is not supported");
    }
    
    // Add any other required APIs here
    
    return errors;
  };

  // Validate environment variables and browser support
  useEffect(() => {
    const configErrors: string[] = [];
    
    if (!VAPI_API_KEY) configErrors.push("Vapi API key not set");
    if (!SHOPIFY_ID) configErrors.push("Shopify assistant ID not set");
    if (!WHATSAPP_ID) configErrors.push("WhatsApp assistant ID not set");
    if (!NOTION_ID) configErrors.push("Notion assistant ID not set");
    if (!BACKEND_URL) configErrors.push("Backend URL not set");
    
    // Check browser compatibility
    const browserErrors = checkBrowserCompatibility();
    const allErrors = [...configErrors, ...browserErrors];
    
    setConfigErrors(allErrors);
    
    if (allErrors.length > 0) {
      console.error("Configuration or browser compatibility issues:", allErrors);
    } else {
      // Only initialize Vapi if all environment variables are present and browser is compatible
      initializeVapi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Vapi
  const initializeVapi = () => {
    if (!VAPI_API_KEY) {
      setError("API key is missing. Please check your environment variables.");
      return;
    }

    try {
      // Initialize with the API key as a string
      const vapiInstance = new Vapi(VAPI_API_KEY);
      vapiRef.current = vapiInstance;

      // Set up event listeners
      vapiInstance.on("call-start", () => {
        setIsCalling(true);
        setIsConnecting(false);
        setError(null);
        setLastEvent({ type: "call-start", data: { timestamp: getTimestamp() } });
        showToast({ 
          title: "Call started", 
          description: `Connected to Navis ${agent.charAt(0).toUpperCase() + agent.slice(1)}`,
          variant: "success" 
        });
      });

      vapiInstance.on("call-end", () => {
        setIsCalling(false);
        setIsConnecting(false);
        setLastEvent({ type: "call-end", data: { timestamp: getTimestamp() } });
        showToast({ 
          title: "Call ended", 
          description: "The voice connection has been closed",
          variant: "default" 
        });
      });

      // Handle transcript updates
      // @ts-expect-error - The Vapi type definitions may not be up to date
      vapiInstance.on("transcript", (message: { text: string }) => {
        console.log("Transcript received:", message);
        const timestamp = getTimestamp();
        setTranscript((prev) => [...prev, { text: message.text, timestamp, isNew: true }]);
        setLastEvent({ type: "transcript", data: { text: message.text, timestamp } });
      });

      // Also listen for the general 'message' event which might contain transcripts
      vapiInstance.on("message", (message: any) => {
        console.log("Message received:", message);
        
        // If this is a transcript message, add it to our transcript
        if (message && message.type === "transcript" && message.text) {
          const timestamp = getTimestamp();
          setTranscript((prev) => [...prev, { text: message.text, timestamp, isNew: true }]);
        }
        
        setLastEvent({ type: "message", data: { message, timestamp: getTimestamp() } });
      });

      vapiInstance.on("speech-start", () => {
        setIsSpeaking(true);
        setLastEvent({ type: "speech-start", data: { timestamp: getTimestamp() } });
      });

      vapiInstance.on("speech-end", () => {
        setIsSpeaking(false);
        setLastEvent({ type: "speech-end", data: { timestamp: getTimestamp() } });
      });

      vapiInstance.on("volume-level", (level) => {
        // Update volume level state
        setVolumeLevel(level);
        
        // Only update last event occasionally to avoid overwhelming the UI
        if (Math.random() < 0.1) {
          setLastEvent({ type: "volume-level", data: { level, timestamp: getTimestamp() } });
        }
      });

      vapiInstance.on("error", (error) => {
        console.error("Vapi error:", error);
        // Log more details about the error
        if (error?.error) {
          console.error("Error details:", JSON.stringify(error.error, null, 2));
        }
        const errorMessage = error?.error?.message || "An error occurred";
        setError(errorMessage);
        setIsCalling(false);
        setIsConnecting(false);
        setLastEvent({ type: "error", data: { error, timestamp: getTimestamp() } });
        showToast({ 
          title: "Error", 
          description: errorMessage,
          variant: "destructive" 
        });
      });

      console.log("Vapi initialized successfully");
    } catch (error) {
      console.error("Error initializing Vapi:", error);
      setError(`Failed to initialize Vapi: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Mark new transcript messages as not new after animation completes
  useEffect(() => {
    const newMessages = transcript.filter(msg => msg.isNew);
    if (newMessages.length > 0) {
      const timers = newMessages.map((_, index) => {
        return setTimeout(() => {
          setTranscript(prev => 
            prev.map((msg, i) => 
              i === transcript.length - 1 - index ? { ...msg, isNew: false } : msg
            )
          );
        }, 500);
      });
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [transcript]);

  // Scroll transcript to bottom when new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  // Check and request microphone permissions
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser doesn't support accessing the microphone");
        showToast({ 
          title: "Browser Not Supported", 
          description: "Your browser doesn't support accessing the microphone",
          variant: "destructive" 
        });
        return false;
      }

      // Request permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If we get here, permission was granted
      console.log("Microphone permission granted");
      
      // Stop all tracks (we just needed to check permission)
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err) {
      console.error("Microphone permission error:", err);
      setError("Microphone permission denied. Please allow microphone access.");
      showToast({ 
        title: "Permission Denied", 
        description: "Microphone permission denied. Please allow microphone access.",
        variant: "destructive" 
      });
      return false;
    }
  };

  const startCall = async () => {
    if (!vapiRef.current) {
      setError("Vapi not initialized");
      showToast({ 
        title: "Error", 
        description: "Vapi not initialized. Please refresh the page.",
        variant: "destructive" 
      });
      return;
    }

    // Check microphone permissions first
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    let assistantId;
    switch (agent) {
      case "shopify":
        assistantId = SHOPIFY_ID;
        break;
      case "whatsapp":
        assistantId = WHATSAPP_ID;
        break;
      case "notion":
        assistantId = NOTION_ID;
        break;
      default:
        assistantId = SHOPIFY_ID;
    }

    if (!assistantId) {
      const errorMsg = `Assistant ID for ${agent} is missing`;
      setError(errorMsg);
      showToast({ 
        title: "Configuration Error", 
        description: errorMsg,
        variant: "destructive" 
      });
      return;
    }

    setIsConnecting(true);
    setTranscript([]);
    setError(null);
    setLastEvent({ type: "connecting", data: { agent, timestamp: getTimestamp() } });

    try {
      // Just use the assistantId without any configuration
      console.log(`Starting call with ${agent} assistant: ${assistantId}`);
      
      // Start with just the assistantId, no overrides
      await vapiRef.current.start(assistantId);
    } catch (err) {
      console.error("Failed to start call:", err);
      setError(`Failed to start call: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsConnecting(false);
      showToast({ 
        title: "Connection Failed", 
        description: "Could not start the voice call. Please try again.",
        variant: "destructive" 
      });
    }
  };

  const stopCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const selectAgent = (selectedAgent: Agent) => {
    if (!isCalling) {
      setAgent(selectedAgent);
    }
  };

  const retryCall = () => {
    setError(null);
    startCall();
  };

  // Agent-specific welcome messages
  const getAgentWelcomeMessage = (): string => {
    switch (agent) {
      case "shopify":
        return "Ask me anything about Shopify's features, APIs, or integrations!";
      case "whatsapp":
        return "Need help with WhatsApp? I can assist with messaging, business tools, and more!";
      case "notion":
        return "I can answer questions about Notion's workspace, databases, and collaboration features!";
      default:
        return "Select a Navis agent and start a conversation!";
    }
  };

  // Toggle debug panel
  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };

  // Function to reinitialize Vapi
  const reinitializeVapi = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    initializeVapi();
    showToast({
      title: "Reinitialized",
      description: "Vapi has been reinitialized",
      variant: "success"
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-border">
      {configErrors.length > 0 && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md" role="alert">
          <h3 className="font-semibold mb-2">Missing Configuration</h3>
          <ul className="list-disc pl-5 text-sm">
            {configErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm">Check your .env.local file and restart the development server.</p>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-semibold">Select Navis Agent</h2>
          {configErrors.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reinitializeVapi}
              className="text-xs"
            >
              Reinitialize
            </Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
          <Button
            variant={agent === "shopify" ? "default" : "outline"}
            onClick={() => selectAgent("shopify")}
            disabled={isCalling || isConnecting}
            className="flex-1"
            aria-label="Select Shopify agent"
          >
            Shopify
          </Button>
          <Button
            variant={agent === "whatsapp" ? "default" : "outline"}
            onClick={() => selectAgent("whatsapp")}
            disabled={isCalling || isConnecting}
            className="flex-1"
            aria-label="Select WhatsApp agent"
          >
            WhatsApp
          </Button>
          <Button
            variant={agent === "notion" ? "default" : "outline"}
            onClick={() => selectAgent("notion")}
            disabled={isCalling || isConnecting}
            className="flex-1"
            aria-label="Select Notion agent"
          >
            Notion
          </Button>
        </div>
        
        {!isCalling && !isConnecting && (
          <p className="text-sm text-muted-foreground mb-4">
            {getAgentWelcomeMessage()}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md" role="alert">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <Button
              onClick={retryCall}
              size="sm"
              className="ml-2 mt-[-4px]"
              aria-label="Retry connection"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-4 sm:mb-6">
        {isConnecting ? (
          <div className="w-full py-4 sm:py-6 flex flex-col items-center justify-center bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-foreground/70 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-foreground/70 animate-pulse delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-foreground/70 animate-pulse delay-300"></div>
            </div>
            <p>Connecting to Navis {agent.charAt(0).toUpperCase() + agent.slice(1)}...</p>
          </div>
        ) : !isCalling ? (
          <Button 
            onClick={startCall} 
            className="w-full py-4 sm:py-6 text-base sm:text-lg"
            aria-label={`Talk to ${agent} assistant`}
            disabled={configErrors.length > 0}
          >
            Talk to Navis {agent.charAt(0).toUpperCase() + agent.slice(1)}
          </Button>
        ) : (
          <Button 
            onClick={stopCall} 
            variant="destructive" 
            className="w-full py-4 sm:py-6 text-base sm:text-lg"
            aria-label="End call"
          >
            End Navis Call
          </Button>
        )}
      </div>

      <div className="mt-4 sm:mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Audio Visualization</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebug}
            className="text-xs"
            aria-label={showDebug ? "Hide debug panel" : "Show debug panel"}
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>
        
        <div className="h-48 sm:h-64">
          <AudioVisualizer
            isActive={isCalling}
            isSpeaking={isSpeaking}
            volumeLevel={volumeLevel}
          />
        </div>
      </div>

      {showDebug && (
        <div className="mt-4 p-3 border border-border rounded-md bg-background/50 text-xs">
          <h4 className="text-sm font-medium mb-2">Debug Information</h4>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Environment Variables:</p>
            <pre className="text-xs bg-muted p-2 rounded-sm mt-1 overflow-x-auto">
              {JSON.stringify({
                VAPI_API_KEY: VAPI_API_KEY,
                SHOPIFY_ID: SHOPIFY_ID,
                WHATSAPP_ID: WHATSAPP_ID,
                NOTION_ID: NOTION_ID,
                BACKEND_URL: BACKEND_URL
              }, null, 2)}
            </pre>
          </div>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Last Event: {lastEvent.type}</p>
            <pre className="text-xs bg-muted p-2 rounded-sm mt-1 overflow-x-auto">
              {JSON.stringify(lastEvent.data || {}, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Raw Transcript:</p>
            <pre className="text-xs bg-muted p-2 rounded-sm mt-1 overflow-x-auto max-h-32">
              {JSON.stringify(transcript, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          {isCalling
            ? "Speak now - your voice is being processed"
            : isConnecting
            ? "Connecting to voice service..."
            : "Click 'Talk' to start a conversation"}
        </p>
      </div>
    </div>
  );
};

export default VoiceAgent; 