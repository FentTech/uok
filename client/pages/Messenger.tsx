import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, MessageCircle, Send, Smile, Video } from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { checkInStorage } from "../lib/dataStorage";
import VideoCall from "../components/VideoCall";
import LocationSharing from "../components/LocationSharing";

type Contact = { id?: string; name?: string; email?: string };
type ChatMessage = { id: string; from: string; fromName: string; to: string; text: string; timestamp: string; kind: "text" | "feeling" };

const channelFor = (email: string) => `uok-messenger-${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

export default function Messenger() {
  const currentUser = localStorage.getItem("currentUser");
  const currentUserData = currentUser ? JSON.parse(currentUser) : {};
  const userEmail = localStorage.getItem("userEmail") || currentUserData.email || "";
  const userName = currentUserData.name || currentUserData.username || "UOK user";
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      setContacts(JSON.parse(localStorage.getItem("bondedContacts") || "[]"));
    } catch {
      setContacts([]);
    }
  }, []);

  const selectedContact = contacts.find((contact) => contact.email === selectedEmail);
  const recentFeelings = useMemo(() => checkInStorage.getAll().filter((item) => item.userEmail === userEmail).slice(0, 5), [userEmail]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userEmail) return;
    const channel = supabase.channel(channelFor(userEmail));
    channel.on("broadcast", { event: "messenger-message" }, ({ payload }: { payload: ChatMessage }) => {
      if (payload.to === userEmail) setMessages((current) => current.some((message) => message.id === payload.id) ? current : [...current, payload]);
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userEmail]);

  const sendMessage = async (messageText: string, kind: ChatMessage["kind"] = "text") => {
    if (!messageText.trim() || !selectedEmail || !userEmail) {
      setStatus("Sign in and choose a bonded member before sending.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setStatus("Messaging is unavailable because realtime service is not configured.");
      return;
    }
    const message: ChatMessage = { id: crypto.randomUUID(), from: userEmail, fromName: userName, to: selectedEmail, text: messageText.trim(), timestamp: new Date().toISOString(), kind };
    const channel = supabase.channel(channelFor(selectedEmail));
    await new Promise<void>((resolve) => channel.subscribe((state) => { if (state === "SUBSCRIBED" || state === "CHANNEL_ERROR" || state === "TIMED_OUT") resolve(); }));
    const deliveryStatus = await channel.send({ type: "broadcast", event: "messenger-message", payload: message });
    await supabase.removeChannel(channel);
    if (deliveryStatus !== "ok") {
      setStatus("The message could not be delivered. Check that both users are online and try again.");
      return;
    }
    setMessages((current) => [...current, message]);
    setStatus("Message delivered.");
    setText("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-blue-700"><ArrowLeft className="h-5 w-5" />Back to dashboard</Link>
          <div className="flex items-center gap-2 font-bold text-blue-700"><Heart className="h-5 w-5" />UOK Messenger</div>
          <Link to="/bond-contacts" className="text-sm font-semibold text-blue-700 hover:underline">Manage bonds</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2"><MessageCircle className="h-6 w-6 text-blue-600" /><div><h1 className="text-xl font-bold text-slate-900">Bonded family messenger</h1><p className="text-sm text-slate-600">Send feelings, messages, calls, videos, and live locations from one place.</p></div></div>
          <label className="block text-sm font-semibold text-slate-800">Choose a bonded family member
            <select value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 sm:max-w-md"><option value="">Select a member</option>{contacts.filter((contact) => contact.email).map((contact) => <option key={contact.email} value={contact.email}>{contact.name || contact.email}</option>)}</select>
          </label>
          {status && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}
          {!selectedContact && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Add bonded members with email addresses to start messaging and calling.</p>}
          {selectedContact && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="mb-3 max-h-64 space-y-2 overflow-y-auto">{messages.filter((message) => message.from === selectedEmail || message.to === selectedEmail).map((message) => <div key={message.id} className={`max-w-[85%] rounded-lg p-3 text-sm ${message.from === userEmail ? "ml-auto bg-blue-600 text-white" : "bg-white text-slate-800"}`}><p>{message.text}</p><time className="mt-1 block text-[10px] opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</time></div>)}{messages.filter((message) => message.from === selectedEmail || message.to === selectedEmail).length === 0 && <p className="py-6 text-center text-sm text-slate-500">No messages yet. Start the conversation.</p>}</div><form onSubmit={(event) => { event.preventDefault(); void sendMessage(text); }} className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message…" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" /><button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-white"><Send className="h-4 w-4" /></button></form><div className="mt-3 flex flex-wrap gap-2">{recentFeelings.map((feeling) => <button key={feeling.id} onClick={() => void sendMessage(`${feeling.emoji} I'm feeling ${feeling.mood}`, "feeling")} className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-800"><Smile className="h-3.5 w-3.5" />Send {feeling.mood}</button>)}</div></div>}
        </section>
        <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900"><Video className="h-4 w-4" />Calls and live location for this bonded space</div><VideoCall contacts={contacts} /><LocationSharing contacts={contacts} /></section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><MapPin className="mr-1 inline h-4 w-4 text-emerald-600" />Location sharing requires the sender to choose a bonded member and the receiver to click <strong>Accept sharing</strong> before opening the live map.</section>
      </main>
    </div>
  );
}
