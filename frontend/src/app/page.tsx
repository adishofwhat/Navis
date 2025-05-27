import VoiceAgent from "@/components/VoiceAgent";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold mb-8">Navis</h1>
      <div className="w-full max-w-2xl">
        <VoiceAgent />
      </div>
    </div>
  );
}
