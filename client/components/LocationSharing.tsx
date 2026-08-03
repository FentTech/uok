import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Navigation, Radio, Square } from "lucide-react";
import { getSupabase } from "../lib/supabase";

type Contact = { name?: string; email?: string };
type LocationSignal = {
  type: "location";
  from: string;
  to: string;
  name: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

const locationChannel = (email: string) => `uok-location-${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

export default function LocationSharing({ contacts }: { contacts: Contact[] }) {
  const currentUser = localStorage.getItem("currentUser");
  const userData = currentUser ? JSON.parse(currentUser) : {};
  const userEmail = localStorage.getItem("userEmail") || userData.email || "";
  const userName = userData.name || userData.username || "UOK user";
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [pendingLocation, setPendingLocation] = useState<LocationSignal | null>(null);
  const [receivedLocation, setReceivedLocation] = useState<LocationSignal | null>(null);
  const acceptedFromRef = useRef("");
  const watchIdRef = useRef<number | null>(null);
  const sendLocation = async (position: GeolocationPosition) => {
    const supabase = getSupabase();
    if (!supabase || !userEmail) {
      setStatus("Sign in to share your location.");
      return;
    }
    if (!selectedEmail) {
      setStatus("Choose a bonded family member first.");
      return;
    }
    const signalBase = {
      type: "location" as const,
      from: userEmail,
      name: userName,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      timestamp: new Date().toISOString(),
    };
    const channel = supabase.channel(locationChannel(selectedEmail));
    await new Promise<void>((resolve) => {
      channel.subscribe((state) => {
        if (state === "SUBSCRIBED" || state === "CHANNEL_ERROR" || state === "TIMED_OUT") resolve();
      });
    });
    await channel.send({ type: "broadcast", event: "location-share", payload: { ...signalBase, to: selectedEmail } });
    await supabase.removeChannel(channel);
    setStatus(`Location request sent to ${contacts.find((contact) => contact.email === selectedEmail)?.name || selectedEmail}.`);
  };

  const shareOnce = () => {
    if (!navigator.geolocation) {
      setStatus("Location sharing is not supported by this browser.");
      return;
    }
    setStatus("Getting your precise location…");
    navigator.geolocation.getCurrentPosition(
      (position) => void sendLocation(position),
      () => setStatus("Location permission was denied or unavailable."),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  };

  const startLiveSharing = () => {
    if (!navigator.geolocation) {
      setStatus("Location sharing is not supported by this browser.");
      return;
    }
    setSharing(true);
    setStatus("Live location sharing is on.");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => void sendLocation(position),
      () => {
        setSharing(false);
        setStatus("Location permission was denied or unavailable.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  };

  const stopLiveSharing = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setSharing(false);
    setStatus("Live location sharing is off.");
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userEmail) return;
    const channel = supabase.channel(locationChannel(userEmail));
    channel.on("broadcast", { event: "location-share" }, ({ payload }: { payload: LocationSignal }) => {
      if (payload.from === userEmail || payload.to !== userEmail || payload.type !== "location") return;
      if (acceptedFromRef.current === payload.from) setReceivedLocation(payload);
      else setPendingLocation(payload);
      if (navigator.vibrate) navigator.vibrate([150, 100, 150]);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("UOK location shared", { body: `${payload.name} shared their live location with you`, icon: "/favicon.ico" });
      }
    }).subscribe();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      void supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900"><LocateFixed className="h-4 w-4" /> Instant location sharing</div>
      <p className="mb-3 text-xs text-emerald-800">Choose a bonded family member to receive your precise GPS location. They must accept before the map is shown. Location is live and is not saved as a permanent history.</p>
      <label className="mb-3 block text-xs font-semibold text-emerald-900" htmlFor="location-recipient">Share with bonded member
        <select id="location-recipient" value={selectedEmail} onChange={(event) => setSelectedEmail(event.target.value)} className="mt-1 block w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-normal text-slate-800">
          <option value="">Choose a bonded family member</option>
          {contacts.filter((contact) => contact.email).map((contact) => <option key={contact.email} value={contact.email}>{contact.name || contact.email}</option>)}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button onClick={shareOnce} disabled={!selectedEmail} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><MapPin className="h-3.5 w-3.5" />Share once</button>
        {!sharing ? <button onClick={startLiveSharing} disabled={!selectedEmail} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Radio className="h-3.5 w-3.5" />Start live sharing</button> : <button onClick={stopLiveSharing} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"><Square className="h-3.5 w-3.5" />Stop sharing</button>}
      </div>
      {status && <p className="mt-2 text-xs text-emerald-800">{status}</p>}
      {pendingLocation && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-900"><Navigation className="mr-1 inline h-3.5 w-3.5" />{pendingLocation.name} wants to share their location with you.</p><button onClick={() => { acceptedFromRef.current = pendingLocation.from; setReceivedLocation(pendingLocation); setPendingLocation(null); }} className="mt-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">Accept sharing</button></div>}
      {receivedLocation && <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3"><p className="text-xs font-semibold text-slate-800"><Navigation className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />Live location from {receivedLocation.name}</p><p className="mt-1 text-xs text-slate-600">Accuracy: approximately {receivedLocation.accuracy} metres</p><a className="mt-2 inline-block text-xs font-semibold text-blue-700 underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${receivedLocation.latitude},${receivedLocation.longitude}`}>Open live location in Google Maps</a></div>}
    </div>
  );
}
