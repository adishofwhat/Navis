globals.css

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #010810;
  font-family: "Inter", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

p {
  margin: 0;
  padding: 0;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}


layout.tsx

import "./globals.css"

export const metadata = {
  title: "Vapi Pizza Assistant",
  description: "A simple pizza ordering voice assistant",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}


page.jsx
"use client"

import { useEffect, useState } from "react"

export default function PizzaAssistant() {
  const [vapi, setVapi] = useState(null)
  const [status, setStatus] = useState("Ready")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [isApiKeyValid, setIsApiKeyValid] = useState(true)

  // Initialize Vapi on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@vapi-ai/web").then((module) => {
        const Vapi = module.default

        // Get API key from environment variables - only check once
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || ""

        if (!apiKey) {
          setErrorMessage("API key is missing. Please check your environment variables.")
          setStatus("Error")
          setIsApiKeyValid(false)
          return
        }

        // Initialize Vapi
        const vapiInstance = new Vapi(apiKey)
        setVapi(vapiInstance)
        setIsApiKeyValid(true)

        // Set up event listeners
        vapiInstance.on("call-start", () => {
          setIsConnecting(false)
          setIsConnected(true)
          setErrorMessage("")
          setStatus("Connected")
        })

        vapiInstance.on("call-end", () => {
          setIsConnecting(false)
          setIsConnected(false)
          setStatus("Call ended")
        })

        vapiInstance.on("speech-start", () => {
          setIsSpeaking(true)
        })

        vapiInstance.on("speech-end", () => {
          setIsSpeaking(false)
        })

        vapiInstance.on("volume-level", (level) => {
          setVolumeLevel(level)
        })

        vapiInstance.on("error", (error) => {
          console.error("Vapi error:", error)
          setIsConnecting(false)

          // Handle different types of errors
          if (error?.error?.message?.includes("card details")) {
            setErrorMessage("Payment required. Visit the Vapi dashboard to set up your payment method.")
          } else if (error?.error?.statusCode === 401 || error?.error?.statusCode === 403) {
            // API key is invalid - update state
            setErrorMessage("API key is invalid. Please check your environment variables.")
            setIsApiKeyValid(false)
          } else {
            setErrorMessage(error?.error?.message || "An error occurred")
          }

          setStatus("Error")
        })
      })
    }

    // Cleanup function
    return () => {
      if (vapi) {
        vapi.stop()
      }
    }
  }, [])

  // Start call function - no need to recheck API key
  const startCall = () => {
    if (!isApiKeyValid) {
      setErrorMessage("Cannot start call: API key is invalid or missing.")
      return
    }

    setIsConnecting(true)
    setStatus("Connecting...")
    setErrorMessage("")

    vapi.start(assistantOptions)
  }

  // End call function
  const endCall = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>Pizza Voice Assistant</h1>

      <div style={{ marginBottom: "20px" }}>
        <p>Status: {status}</p>

        {isConnected && (
          <div style={{ marginTop: "10px" }}>
            <p>{isSpeaking ? "Assistant is speaking" : "Assistant is listening"}</p>

            {/* Simple volume indicator */}
            <div
              style={{
                display: "flex",
                marginTop: "10px",
                marginBottom: "10px",
                gap: "3px",
              }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: "15px",
                    height: "15px",
                    backgroundColor: i / 10 < volumeLevel ? "#3ef07c" : "#444",
                    borderRadius: "2px",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          style={{
            backgroundColor: "#f03e3e",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <p>{errorMessage}</p>

          {errorMessage.includes("payment") && (
            <a
              href="https://dashboard.vapi.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                color: "white",
                textDecoration: "underline",
              }}
            >
              Go to Vapi Dashboard
            </a>
          )}
        </div>
      )}

      <button
        onClick={isConnected ? endCall : startCall}
        disabled={isConnecting || !isApiKeyValid}
        style={{
          backgroundColor: isConnected ? "#f03e3e" : "white",
          color: isConnected ? "white" : "black",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: isConnecting || !isApiKeyValid ? "not-allowed" : "pointer",
          opacity: isConnecting || !isApiKeyValid ? 0.7 : 1,
        }}
      >
        {isConnecting ? "Connecting..." : isConnected ? "End Call" : "Call Pizza Shop"}
      </button>

      <a
        href="https://docs.vapi.ai"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          top: "25px",
          right: "25px",
          padding: "5px 10px",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        return to docs
      </a>
    </div>
  )
}

// Pizza assistant configuration
const assistantOptions = {
  name: "Pizza Assistant",
  firstMessage: "Vappy's Pizzeria speaking, how can I help you?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a voice assistant for Vappy's Pizzeria, a pizza shop located on the Internet.

Your job is to take the order of customers calling in. The menu has only 3 types
of items: pizza, sides, and drinks. There are no other types of items on the menu.

1) There are 3 kinds of pizza: cheese pizza, pepperoni pizza, and vegetarian pizza
(often called "veggie" pizza).
2) There are 3 kinds of sides: french fries, garlic bread, and chicken wings.
3) There are 2 kinds of drinks: soda, and water. (if a customer asks for a
brand name like "coca cola", just let them know that we only offer "soda")

Customers can only order 1 of each item. If a customer tries to order more
than 1 item within each category, politely inform them that only 1 item per
category may be ordered.

Customers must order 1 item from at least 1 category to have a complete order.
They can order just a pizza, or just a side, or just a drink.

Be sure to introduce the menu items, don't assume that the caller knows what
is on the menu (most appropriate at the start of the conversation).

If the customer goes off-topic or off-track and talks about anything but the
process of ordering, politely steer the conversation back to collecting their order.

Once you have all the information you need pertaining to their order, you can
end the conversation. You can say something like "Awesome, we'll have that ready
for you in 10-20 minutes." to naturally let the customer know the order has been
fully communicated.

It is important that you collect the order in an efficient manner (succinct replies
& direct questions). You only have 1 task here, and it is to collect the customers
order, then end the conversation.

- Be sure to be kind of funny and witty!
- Keep all your responses short and simple. Use casual language, phrases like "Umm...", "Well...", and "I mean" are preferred.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
}


button.jsx

"use client"

import ScaleLoader from "react-spinners/ScaleLoader"

const Button = ({ label, onClick, isLoading, disabled }) => {
  const opacity = disabled ? 0.75 : 1
  const cursor = disabled ? "not-allowed" : "pointer"

  const Contents = isLoading ? (
    <ScaleLoader
      color="#000"
      height={10}
      width={2.5}
      margin={0.5}
      loading={true}
      size={50}
      css={{ display: "block", margin: "0 auto" }}
    />
  ) : (
    <p style={{ margin: 0, padding: 0 }}>{label}</p>
  )

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "white",
        color: "black",
        border: "2px solid #ddd",
        borderRadius: "8px",
        padding: "8px 20px",
        fontSize: "16px",
        outline: "none",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        opacity,
        cursor,
      }}
    >
      {Contents}
    </button>
  )
}

export default Button


AssistantSpeechIndicator.jsx

const AssistantSpeechIndicator = ({ isSpeaking }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
      <div
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: isSpeaking ? "#3ef07c" : "#f03e3e",
          marginRight: "10px",
          borderRadius: "4px",
        }}
      />
      <p style={{ color: "white", margin: 0 }}>{isSpeaking ? "Assistant speaking" : "Assistant not speaking"}</p>
    </div>
  )
}

export default AssistantSpeechIndicator


VolumeLevel.jsx

const numBars = 10

const VolumeLevel = ({ volume }) => {
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ color: "white", marginBottom: "8px" }}>
        <p>Volume Level:</p>
      </div>
      <div style={{ display: "flex", marginBottom: "10px" }}>
        {Array.from({ length: numBars }, (_, i) => (
          <div
            key={i}
            style={{
              width: "20px",
              height: "20px",
              margin: "2px",
              backgroundColor: i / numBars < volume ? "#3ef07c" : "white",
              borderRadius: "2px",
            }}
          />
        ))}
      </div>
      <div style={{ color: "white" }}>{volume}</div>
    </div>
  )
}

export default VolumeLevel

ActiveCallDetail.jsx

"use client"

import AssistantSpeechIndicator from "./call/AssistantSpeechIndicator"
import Button from "./base/Button"
import VolumeLevel from "./call/VolumeLevel"

const ActiveCallDetail = ({ assistantIsSpeaking, volumeLevel, onEndCallClick }) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
          width: "400px",
          height: "200px",
        }}
      >
        <AssistantSpeechIndicator isSpeaking={assistantIsSpeaking} />
        <VolumeLevel volume={volumeLevel} />
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button label="End Call" onClick={onEndCallClick} />
      </div>
    </div>
  )
}

export default ActiveCallDetail


next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add env configuration to expose NEXT_PUBLIC_VAPI_API_KEY to the client
  env: {
    NEXT_PUBLIC_VAPI_API_KEY: process.env.NEXT_PUBLIC_VAPI_API_KEY || '',
  },
};

export default nextConfig;

package.json

{
  "name": "vapi-pizza-assistant",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@vapi-ai/web": "^1.0.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
