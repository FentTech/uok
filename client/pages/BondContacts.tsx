import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Copy,
  Check,
  Smartphone,
  Link2,
  Users,
  ArrowLeft,
} from "lucide-react";

interface BondedContact {
  id: string;
  name: string;
  email?: string;
  bondCode: string;
  status: "pending" | "bonded";
  bondedAt: string;
  emoji: string;
}

export default function BondContacts() {
  const [userBondCode] = useState(() => {
    return `UOK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  });

  const [bondedContacts, setBondedContacts] = useState<BondedContact[]>(() => {
    const stored = localStorage.getItem("bondedContacts");
    return stored ? JSON.parse(stored) : [];
  });

  const [scanMode, setScanMode] = useState(false);
  const [manualBondCode, setManualBondCode] = useState("");
  const [bondName, setBondName] = useState("");
  const [bondEmail, setBondEmail] = useState("");
  const [bondError, setBondError] = useState("");
  const [bondSuccess, setBondSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const canAddMore = bondedContacts.length < 3;

  const copyBondCode = () => {
    navigator.clipboard.writeText(userBondCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBondUser = async () => {
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

    if (!bondEmail.trim()) {
      setBondError("Please enter their email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bondEmail)) {
      setBondError("Please enter a valid email address");
      return;
    }

    if (manualBondCode === userBondCode) {
      setBondError("You cannot bond with yourself!");
      return;
    }

    if (bondedContacts.some((c) => c.bondCode === manualBondCode)) {
      setBondError("This contact is already bonded");
      return;
    }

    const newContact: BondedContact = {
      id: Date.now().toString(),
      name: bondName,
      email: bondEmail,
      bondCode: manualBondCode,
      status: "bonded",
      bondedAt: new Date().toLocaleString(),
      emoji: ["👩", "👨", "👨‍🤝‍👨", "👤"][bondedContacts.length % 4],
    };

    setBondedContacts((prev) => {
      const updated = [newContact, ...prev];
      localStorage.setItem("bondedContacts", JSON.stringify(updated));

      // Sync to Firebase for cross-device availability
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        import("../lib/firebase").then(({ firebaseUserSyncService }) => {
          firebaseUserSyncService
            .syncBondedContacts(userEmail, updated)
            .catch((error) =>
              console.log("Firebase sync not available:", error),
            );
        });
      }

      return updated;
    });
    setBondSuccess(true);
    setManualBondCode("");
    setBondName("");
    setBondEmail("");

    setTimeout(() => {
      setBondSuccess(false);
      setScanMode(false);
    }, 2000);
  };

  const removeBond = (id: string) => {
    setBondedContacts((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem("bondedContacts", JSON.stringify(updated));

      // Sync to Firebase for cross-device availability
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        import("../lib/firebase").then(({ firebaseUserSyncService }) => {
          firebaseUserSyncService
            .syncBondedContacts(userEmail, updated)
            .catch((error) =>
              console.log("Firebase sync not available:", error),
            );
        });
      }

      return updated;
    });
  };

  const generateShareableLink = () => {
    return `${window.location.origin}/?bond=${userBondCode}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 hover:text-cyan-200">
              Back to Dashboard
            </span>
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
            Connect with family members securely through app-to-app bonding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Your Bond Code Section */}
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-cyan-100">
                  Your Bond Code
                </h2>
              </div>

              <p className="text-sm text-cyan-300/80 mb-6">
                Share this code with family members to bond with you.
              </p>

              <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg p-4 border border-cyan-400/30 mb-6">
                <p className="text-xs text-cyan-400 mb-2">
                  YOUR PERSONAL BOND CODE
                </p>
                <p className="text-3xl font-bold font-mono text-cyan-100 break-all">
                  {userBondCode}
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={copyBondCode}
                  className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
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
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-cyan-400/20">
                <p className="text-xs text-cyan-300 mb-2">Share this link:</p>
                <p className="text-xs text-cyan-400 break-all font-mono">
                  {generateShareableLink()}
                </p>
              </div>

              <p className="text-xs text-cyan-400/60 mt-4">
                Family members will enter your code to bond with you.
              </p>
            </div>
          </div>

          {/* Add Emergency Contact Section */}
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
                  Ask your family member to share their bond code.
                </p>

                <button
                  onClick={() => setScanMode(true)}
                  disabled={!canAddMore}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone className="w-5 h-5 inline mr-2" />
                  Enter Bond Code
                </button>

                {!canAddMore && (
                  <p className="text-sm text-amber-400 text-center bg-amber-500/10 rounded p-2 border border-amber-400/20">
                    ✓ Maximum 3 bonded contacts reached
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-cyan-300 block mb-2">
                    Their Bond Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter code (e.g., UOKABCD123)"
                    value={manualBondCode}
                    onChange={(e) =>
                      setManualBondCode(e.target.value.toUpperCase())
                    }
                    className="w-full bg-white/10 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300 block mb-2">
                    Their Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mom, Brother"
                    value={bondName}
                    onChange={(e) => setBondName(e.target.value)}
                    className="w-full bg-white/10 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-cyan-300 block mb-2">
                    Their Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g., mom@example.com"
                    value={bondEmail}
                    onChange={(e) => setBondEmail(e.target.value)}
                    className="w-full bg-white/10 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {bondError && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
                    <p className="text-red-300 text-sm">⚠ {bondError}</p>
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
                    Bond Now
                  </button>
                  <button
                    onClick={() => {
                      setScanMode(false);
                      setManualBondCode("");
                      setBondName("");
                      setBondEmail("");
                      setBondError("");
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-300 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-cyan-400/60 text-center">
                  Ask them to share their bond code from Bond Contacts page
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
              Bonded Contacts ({bondedContacts.length}/3)
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
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {contact.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-cyan-100">
                          {contact.name}
                        </p>
                        {contact.email && (
                          <p className="text-xs text-cyan-400/80">
                            {contact.email}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-green-400">
                            ✓ Bonded
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
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-cyan-400/40 mx-auto mb-3" />
              <p className="text-cyan-300/80 mb-4">
                No bonded contacts yet. Start by sharing your bond code!
              </p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-cyan-100 mb-4">
            📲 How Bonding Works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400 min-w-fit">Step 1:</span>
              <p className="text-sm text-cyan-300/80">
                Share your Bond Code above with family members
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400 min-w-fit">Step 2:</span>
              <p className="text-sm text-cyan-300/80">
                Family members enter your code in their Bond Contacts
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400 min-w-fit">Step 3:</span>
              <p className="text-sm text-cyan-300/80">
                Once bonded, they receive all your daily check-ins
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-cyan-400 min-w-fit">Step 4:</span>
              <p className="text-sm text-cyan-300/80">
                If you miss a check-in for 10+ minutes, they get emergency
                alerts
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
            <p className="text-sm text-cyan-300">
              💚 <strong>Max 3 bonded contacts.</strong> Your emergency contacts
              will be notified of your daily wellness check-ins to ensure your
              safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
