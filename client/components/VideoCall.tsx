import { useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, Phone, PhoneCall, Video, VideoOff, X } from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { audioUtils } from "../lib/audioUtils";

type Contact = { name?: string; email?: string };
type Signal = { type: string; callId: string; from: string; to: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit; name?: string; mode?: "audio" | "video" };

const emailKey = (email: string) => email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");

export default function VideoCall({ contacts }: { contacts: Contact[] }) {
  const userEmail = localStorage.getItem("userEmail") || "";
  const user = localStorage.getItem("currentUser");
  const userName = user ? JSON.parse(user).name || JSON.parse(user).username : "UOK user";
  const [incoming, setIncoming] = useState<Signal | null>(null);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [callId, setCallId] = useState("");
  const callIdRef = useRef("");
  const [callState, setCallState] = useState<"idle" | "calling" | "connected">("idle");
  const [callMode, setCallMode] = useState<"audio" | "video">("video");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState("");
  const channelRef = useRef<any>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ringtoneRef = useRef<number | null>(null);

  const stopRingtone = () => {
    if (ringtoneRef.current) window.clearInterval(ringtoneRef.current);
    ringtoneRef.current = null;
  };

  const send = (signal: Omit<Signal, "from">) => {
    channelRef.current?.send({ type: "broadcast", event: "call-signal", payload: { ...signal, from: userEmail } });
  };

  const cleanup = (notify = true) => {
    stopRingtone();
    if (notify && activeContact?.email && callId) send({ type: "end", callId, to: activeContact.email });
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIncoming(null);
    setActiveContact(null);
    setCallId("");
    callIdRef.current = "";
    setCallState("idle");
    setError("");
  };

  const createPeer = async (id: string, otherEmail: string, mode: "audio" | "video") => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: mode === "video", audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerRef.current = peer;
    remoteStreamRef.current = new MediaStream();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => event.streams[0]?.getTracks().forEach((track) => remoteStreamRef.current?.addTrack(track));
    peer.onicecandidate = (event) => event.candidate && send({ type: "ice", callId: id, to: otherEmail, candidate: event.candidate.toJSON() });
    return peer;
  };

  const acceptCall = async () => {
    if (!incoming) return;
    const signal = incoming;
    setIncoming(null);
    stopRingtone();
    setActiveContact({ email: signal.from, name: signal.name });
    setCallMode(signal.mode || "video");
    setCallId(signal.callId);
    callIdRef.current = signal.callId;
    try {
      const peer = await createPeer(signal.callId, signal.from, signal.mode || "video");
      await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      send({ type: "answer", callId: signal.callId, to: signal.from, sdp: answer });
      setCallState("connected");
    } catch (err) {
      setError("Camera or microphone permission is required for video calls.");
      cleanup(false);
    }
  };

  const startCall = async (contact: Contact, mode: "audio" | "video") => {
    if (!contact.email || !userEmail) return;
    const id = crypto.randomUUID();
    setActiveContact(contact);
    setCallMode(mode);
    setCallId(id);
    callIdRef.current = id;
    setCallState("calling");
    try {
      const peer = await createPeer(id, contact.email, mode);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      send({ type: "invite", callId: id, to: contact.email, sdp: offer, name: userName, mode });
    } catch (err) {
      setError("Camera or microphone permission is required for video calls.");
      cleanup(false);
    }
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userEmail) return;
    const channel = supabase.channel(`uok-call-${emailKey(userEmail)}`);
    channel.on("broadcast", { event: "call-signal" }, async ({ payload }: { payload: Signal }) => {
      if (payload.to !== userEmail) return;
      if (payload.type === "invite") {
        setIncoming(payload);
        ringtoneRef.current = window.setInterval(() => audioUtils.playBeep(740, 180), 1100);
      } else if (payload.callId !== callIdRef.current) return;
      if (payload.type === "answer" && peerRef.current && payload.sdp) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        setCallState("connected");
      } else if (payload.type === "ice" && peerRef.current && payload.candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } else if (payload.type === "end") {
        cleanup(false);
      }
    }).subscribe();
    channelRef.current = channel;
    return () => { stopRingtone(); channel.unsubscribe(); cleanup(false); };
  }, [userEmail]);

  const canCall = Boolean(userEmail);

  return (
    <>
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900"><PhoneCall className="h-4 w-4" /> Call a bonded family member</div>
        {contacts.length > 0 ? <div className="space-y-2">{contacts.map((contact, index) => <div key={`${contact.email}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-2"><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{contact.name || contact.email}</span><div className="flex gap-1"><button onClick={() => startCall(contact, "audio")} disabled={!canCall || !contact.email || callState !== "idle"} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"><Phone className="h-3.5 w-3.5" />Call</button><button onClick={() => startCall(contact, "video")} disabled={!canCall || !contact.email || callState !== "idle"} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Video className="h-3.5 w-3.5" />Video</button></div></div>)}</div> : <p className="text-xs text-slate-600">No bonded family members yet. Add one below to enable calling.</p>}
        {!canCall && <p className="mt-2 text-xs text-amber-700">Log in with your account email to place calls.</p>}
      </div>

      {incoming && <div className="fixed inset-x-3 top-20 z-[60] mx-auto max-w-sm rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl"><div className="flex items-center gap-3"><div className="rounded-full bg-green-100 p-3 text-green-700"><PhoneCall className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-bold text-slate-900">Incoming video call</p><p className="truncate text-sm text-slate-600">{incoming.name || incoming.from}</p></div></div><div className="mt-4 flex gap-2"><button onClick={acceptCall} className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"><Check className="mr-1 inline h-4 w-4" />Answer</button><button onClick={() => { stopRingtone(); send({ type: "end", callId: incoming.callId, to: incoming.from }); setIncoming(null); }} className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"><X className="mr-1 inline h-4 w-4" />Decline</button></div></div>}

      {callState !== "idle" && <div className="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-2xl sm:inset-8"><div className="flex items-center justify-between p-3 text-white"><span className="text-sm font-semibold">{callState === "calling" ? `Calling ${activeContact?.name || activeContact?.email}…` : `Connected to ${activeContact?.name || activeContact?.email}`}</span><button onClick={() => cleanup()}><X /></button></div><div className="relative flex min-h-0 flex-1 items-center justify-center bg-black"><video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" /><video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 h-28 w-40 rounded-lg border border-white object-cover sm:h-36 sm:w-52" /></div>{error && <p className="bg-red-900 px-3 py-2 text-center text-xs text-red-100">{error}</p>}<div className="flex justify-center gap-3 p-3"><button onClick={() => { const tracks = localStreamRef.current?.getAudioTracks() || []; tracks.forEach((track) => track.enabled = muted); setMuted(!muted); }} className="rounded-full bg-white/10 p-3 text-white">{muted ? <MicOff /> : <Mic />}</button><button onClick={() => { const tracks = localStreamRef.current?.getVideoTracks() || []; tracks.forEach((track) => track.enabled = cameraOff); setCameraOff(!cameraOff); }} className="rounded-full bg-white/10 p-3 text-white">{cameraOff ? <VideoOff /> : <Video />}</button><button onClick={() => cleanup()} className="rounded-full bg-red-600 p-3 text-white"><Phone /></button></div></div>}
    </>
  );
}
