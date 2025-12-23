import { ChatInterface } from '@/components/chat-interface';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-screen flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
        <ChatInterface />
      </main>
    </div>
  );
}
