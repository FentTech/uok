import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Copy, Check, Smartphone, Link2, Users, ArrowLeft } from "lucide-react";
import QRCode from "qrcode.react";

interface BondedContact {
  id: string;
  name: string;
  bondCode: string;
  status: "pending" | "bonded";
  bondedAt: string;
  emoji: string;
}

export default function BondContacts() {
  const [userQRCode] = useState(() => {
    // Generate unique bond code for this user
    return `UOK_USER_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  });

  const [bondedContacts, setBondedContacts] = useState<BondedContact[]>([
    {
      id: "1",
      name: "Mom",
      bondCode: "UOK_USER_ABC123",
      status: "bonded",
      bondedAt: "Today at 08:30 AM",
      emoji: "👩",
    },
    {
      id: "2",
      name: "Brother",
      bondCode: "UOK_USER_DEF456",
      status: "bonded",
      bondedAt: "Yesterday",
      emoji: "👨",
    },
  ]);

  const [scanMode, setScanMode] = useState(false);
  const [manualBondCode, setManualBondCode] = useState("");
  const [bondName, setBondName] = useState("");
  const [bondError, setBondError] = useState("");
  const [bondSuccess, setBondSuccess] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const canAddMore = bondedContacts.length < 3;

  const copyBondCode = () => {
    navigator.clipboard.writeText(userQRCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBondUser = () => {
    setBondError("");
    setBondSuccess(false);

    if (!manualBondCode.trim()) {
      setBondError("Please enter a bond code");
      return;
    }

    if (!bondName.trim()) {
      setBondError("Please enter the contact name");
      return;
    }

    if (manualBondCode === userQRCode) {
      setBondError("You cannot bond with yourself!");
      return;
    }

    if (bondedContacts.some((c) => c.bondCode === manualBondCode)) {
      setBondError("This contact is already bonded");
      return;
    }

    // Add new bonded contact
    const newContact: BondedContact = {
      id: Date.now().toString(),
      name: bondName,
      bondCode: manualBondCode,
      status: "bonded",
      bondedAt: new Date().toLocaleString(),
      emoji: "👤",
    };

    setBondedContacts((prev) => [newContact, ...prev]);
    setBondSuccess(true);
    setManualBondCode("");
    setBondName("");

    setTimeout(() => {
      setBondSuccess(false);
      setScanMode(false);
    }, 2000);
  };

  const removeBond = (id: string) => {
    setBondedContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `uok-bond-code-${userQRCode}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 hover:text-cyan-200">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              UOK
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Bond Emergency Contacts
          </h1>
          <p className="text-cyan-300/80">
            Connect with family members through app-to-app bonding. Max 3 emergency contacts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Your QR Code Section */}
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-cyan-100">Your Bond Code</h2>
              </div>

              <p className="text-sm text-cyan-300/80 mb-4">
                Share this QR code with family members to bond with you
              </p>

              {/* QR Code */}
              <div
                ref={qrRef}
                className="bg-white p-4 rounded-lg mb-4 flex justify-center"
              >
                <QRCode
                  value={userQRCode}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-3">
                {/* Bond Code Display */}
                <div className="bg-white/5 rounded-lg p-3 border border-cyan-400/20">
                  <p className="text-xs text-cyan-400 mb-1">Manual Bond Code</p>
                  <p className="text-lg font-mono text-cyan-100 break-all">
                    {userQRCode}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={copyBondCode}
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition"
                  >
                    Download QR
                  </button>
                </div>

                <p className="text-xs text-cyan-400/60 mt-4">
                  Share your QR code with family members so they can scan and bond with you.
                </p>
              </div>
            </div>
          </div>

          {/* Scan QR Code Section */}
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-cyan-100">
                {scanMode ? "Enter Bond Code" : "Add Emergency Contact"}
              </h2>
            </div>

            {!scanMode ? (
              <div className="space-y-4">
                <p className="text-sm text-cyan-300/80">
                  Ask your family member to share their QR code or bond code, then enter it below.
                </p>

                <button
                  onClick={() => setScanMode(true)}
                  disabled={!canAddMore}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-5 h-5" />
                  Scan QR Code or Enter Code
                </button>

                {!canAddMore && (
                  <p className="text-sm text-amber-400 text-center">
                    You have bonded with 3 emergency contacts (maximum reached)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter their bond code (UOK_USER_...)"
                  value={manualBondCode}
                  onChange={(e) => setManualBondCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/10 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <input
                  type="text"
                  placeholder="What's their relationship? (e.g., Mom, Brother)"
                  value={bondName}
                  onChange={(e) => setBondName(e.target.value)}
                  className="w-full bg-white/10 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                {bondError && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{bondError}</p>
                  </div>
                )}

                {bondSuccess && (
                  <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3">
                    <p className="text-green-300 text-sm">
                      ✓ Successfully bonded with {bondName}!
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleBondUser}
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
                  >
                    Bond Contact
                  </button>
                  <button
                    onClick={() => {
                      setScanMode(false);
                      setManualBondCode("");
                      setBondName("");
                      setBondError("");
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-cyan-400/60 text-center">
                  Ask family members to share their personal QR code or bond code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bonded Contacts List */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-cyan-100">
              Bonded Emergency Contacts ({bondedContacts.length}/3)
            </h2>
          </div>

          {bondedContacts.length > 0 ? (
            <div className="space-y-3">
              {bondedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {contact.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-cyan-100">{contact.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyan-400">
                            ✓ {contact.status === "bonded" ? "Bonded" : "Pending"}
                          </span>
                          <span className="text-xs text-cyan-400/60">
                            {contact.bondedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBond(contact.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-cyan-300/80 mb-4">
                No bonded contacts yet. Add family members using QR codes to get started!
              </p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-cyan-100 mb-4">How Bonding Works</h3>
          <div className="space-y-3 text-sm text-cyan-300/80">
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400">1.</span>
              <p>Share your QR code with family members (print, text, or show on screen)</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400">2.</span>
              <p>They scan your code in their UOK app to initiate bonding</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400">3.</span>
              <p>Once bonded, they receive all your daily check-in notifications</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400">4.</span>
              <p>If you miss a check-in, they get alerts after 10 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
