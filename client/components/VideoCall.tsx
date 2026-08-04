import { useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, Phone, PhoneCall, Video, VideoOff, X } from "lucide-react";
import { getSupabase } from "../lib/supabase";

type Contact = { name?: string; email?: string };
type Signal = { type: string; callId: string; from: string; to: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit; name?: string; mode?: "audio" | "video" };

const emailKey = (email: string) => email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");

const iceServers: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
      "turns:openrelay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayprojectsecret",
  },
];

export default function VideoCall({ contacts }: { contacts: Contact[] }) {
  const user = localStorage.getItem("currentUser");
  const userData = user ? JSON.parse(user) : {};
  const userEmail = localStorage.getItem("userEmail") || userData.email || "";
  const userName = userData.name || userData.username || "UOK user";
  const [incoming, setIncoming] = useState<Signal | null>(null);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [callId, setCallId] = useState("");
  const callIdRef = useRef("");
  const [callState, setCallState] = useState<"idle" | "calling" | "connected">("idle");
  const [callMode, setCallMode] = useState<"audio" | "video">("video");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const ringtoneRef = useRef<number | null>(null);
  const ringtoneContextRef = useRef<AudioContext | null>(null);
  const ringtoneOscillatorRef = useRef<OscillatorNode | null>(null);
  const ringtoneGainRef = useRef<GainNode | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const stopRingtone = () => {
    if (ringtoneRef.current) window.clearInterval(ringtoneRef.current);
    ringtoneRef.current = null;
    try {
      ringtoneOscillatorRef.current?.stop();
    } catch {
      // The oscillator may already be stopped.
    }
    ringtoneOscillatorRef.current = null;
    ringtoneGainRef.current?.disconnect();
    ringtoneGainRef.current = null;
  };

  const startRingtone = () => {
    stopRingtone();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = ringtoneContextRef.current || new AudioContextClass();
      ringtoneContextRef.current = context;
      void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 720;
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      ringtoneOscillatorRef.current = oscillator;
      ringtoneGainRef.current = gain;
      const pulse = () => {
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
        gain.gain.setValueAtTime(0.16, now + 0.32);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.38);
      };
      pulse();
      ringtoneRef.current = window.setInterval(pulse, 900);
    } catch (error) {
      console.warn("Call ringtone could not start:", error);
    }
  };

  const unlockAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = ringtoneContextRef.current || new AudioContextClass();
      ringtoneContextRef.current = context;
      if (context.state === "suspended") void context.resume();
    } catch (error) {
      console.warn("Call audio could not be unlocked:", error);
    }
  };

  const send = async (signal: Omit<Signal, "from">) => {
    const supabase = getSupabase();
    if (!supabase || !signal.to) return;
    const channel = supabase.channel(`uok-call-${emailKey(signal.to)}`);
    await new Promise<void>((resolve) => channel.subscribe((state) => {
      if (state === "SUBSCRIBED" || state === "CHANNEL_ERROR" || state === "TIMED_OUT") resolve();
    }));
    await channel.send({ type: "broadcast", event: "call-signal", payload: { ...signal, from: userEmail } });
    await supabase.removeChannel(channel);
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
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("This browser does not support microphone or camera access.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: mode === "video", audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    pendingCandidatesRef.current = [];
    const peer = new RTCPeerConnection({ iceServers, iceTransportPolicy: "all" });
    peerRef.current = peer;
    remoteStreamRef.current = new MediaStream();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStreamRef.current;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.ontrack = (event) => event.streams[0]?.getTracks().forEach((track) => remoteStreamRef.current?.addTrack(track));
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed") setError("The mobile network could not establish a relay connection. Please try again on Wi-Fi or mobile data.");
    };
    peer.onicecandidate = (event) => event.candidate && send({ type: "ice", callId: id, to: otherEmail, candidate: event.candidate.toJSON() });
    return peer;
  };

  useEffect(() => {
    if (!remoteStreamRef.current) return;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
      void remoteAudioRef.current.play().catch(() => undefined);
    }
  }, [callState, callMode]);

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
      for (const candidate of pendingCandidatesRef.current.splice(0)) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      send({ type: "answer", callId: signal.callId, to: signal.from, sdp: answer });
      setCallState("connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera or microphone access failed. Check browser permissions and try again.");
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
    startRingtone();
    try {
      const peer = await createPeer(id, contact.email, mode);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      send({ type: "invite", callId: id, to: contact.email, sdp: offer, name: userName, mode });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera or microphone access failed. Check browser permissions and try again.");
      cleanup(false);
    }
  };

  useEffect(() => {
    const handleAudioUnlock = () => unlockAudio();
    window.addEventListener("pointerdown", handleAudioUnlock, { passive: true });
    window.addEventListener("keydown", handleAudioUnlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleAudioUnlock);
      window.removeEventListener("keydown", handleAudioUnlock);
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userEmail) return;
    const channel = supabase.channel(`uok-call-${emailKey(userEmail)}`);
    channel.on("broadcast", { event: "call-signal" }, async ({ payload }: { payload: Signal }) => {
      if (payload.to !== userEmail) return;
      if (payload.type === "invite") {
        setIncoming(payload);
        startRingtone();
        if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 500]);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(payload.mode === "audio" ? "Incoming UOK call" : "Incoming UOK video call", {
            body: `${payload.name || payload.from} is calling you`,
            icon: "/favicon.ico",
            tag: `uok-call-${payload.callId}`,
          });
        }
      } else if (payload.callId !== callIdRef.current) return;
      if (payload.type === "answer" && peerRef.current && payload.sdp) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        for (const candidate of pendingCandidatesRef.current.splice(0)) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        stopRingtone();
        setCallState("connected");
      } else if (payload.type === "ice" && payload.candidate) {
        if (peerRef.current?.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } else {
          pendingCandidatesRef.current.push(payload.candidate);
        }
      } else if (payload.type === "end") {
        cleanup(false);
      }
    }).subscribe();
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

      {incoming && <div className="fixed inset-x-3 top-20 z-[60] mx-auto max-w-sm rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl"><div className="flex items-center gap-3"><div className="rounded-full bg-green-100 p-3 text-green-700"><PhoneCall className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-bold text-slate-900">Incoming {incoming.mode === "audio" ? "call" : "video call"}</p><p className="truncate text-sm text-slate-600">{incoming.name || incoming.from}</p></div></div><div className="mt-4 flex gap-2"><button onClick={acceptCall} className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"><Check className="mr-1 inline h-4 w-4" />Answer</button><button onClick={() => { stopRingtone(); send({ type: "end", callId: incoming.callId, to: incoming.from }); setIncoming(null); }} className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"><X className="mr-1 inline h-4 w-4" />Decline</button></div></div>}

      {callState !== "idle" && <div className="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-2xl sm:inset-8"><div className="flex items-center justify-between p-3 text-white"><span className="text-sm font-semibold">{callState === "calling" ? `${callMode === "audio" ? "Calling" : "Video calling"} ${activeContact?.name || activeContact?.email}…` : `${callMode === "audio" ? "Call" : "Video call"} connected to ${activeContact?.name || activeContact?.email}`}</span><button onClick={() => cleanup()}><X /></button></div><div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">{callMode === "video" ? <><video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" /><video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 h-28 w-40 rounded-lg border border-white object-cover sm:h-36 sm:w-52" /></> : <div className="text-center text-white"><audio ref={remoteAudioRef} autoPlay controls className="mx-auto mb-4 w-64" /><PhoneCall className="mx-auto mb-3 h-12 w-12" /><p>Audio call in progress</p></div>}</div>{error && <p className="bg-red-900 px-3 py-2 text-center text-xs text-red-100">{error}</p>}<div className="flex justify-center gap-3 p-3"><button onClick={() => { const tracks = localStreamRef.current?.getAudioTracks() || []; tracks.forEach((track) => track.enabled = muted); setMuted(!muted); }} className="rounded-full bg-white/10 p-3 text-white">{muted ? <MicOff /> : <Mic />}</button><button onClick={() => { const tracks = localStreamRef.current?.getVideoTracks() || []; tracks.forEach((track) => track.enabled = cameraOff); setCameraOff(!cameraOff); }} className="rounded-full bg-white/10 p-3 text-white">{cameraOff ? <VideoOff /> : <Video />}</button><button onClick={() => cleanup()} className="rounded-full bg-red-600 p-3 text-white"><Phone /></button></div></div>}
    </>
  );
}
