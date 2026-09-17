import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, ShieldCheck, Flame } from 'lucide-react';
import { DatabaseStatus } from '../types.ts';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DatabaseStatus | null;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isConnected = status?.mode === 'firestore';

  const envSample = `# Firebase Firestore Configuration (Backend Service Account)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYourPrivateKeyHere\\n-----END PRIVATE KEY-----\\n"

# Or alternately, provide service account JSON file:
# GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="firebase-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="firebase-modal-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden transition-all animate-in zoom-in-95 duration-150 my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}>
              {isConnected ? <Flame className="w-5 h-5 text-amber-500" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Firebase Firestore Setup & Status
              </h2>
              <p className="text-xs text-slate-500">
                Zero-hardcoded-credentials architecture with backend environment variables.
              </p>
            </div>
          </div>
          <button
            id="firebase-modal-close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Current Status Box */}
          <div className={`p-4 rounded-xl border ${
            isConnected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                {isConnected ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Database className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-bold">
                  {isConnected
                    ? 'Connected to Live Firebase Firestore'
                    : 'Running in Local Development Mode (In-Memory Fallback)'}
                </p>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {status?.message || 'Ready for Firebase credentials.'}
                </p>
                {!isConnected && (
                  <p className="text-xs mt-2 font-medium text-amber-800">
                    Full CRUD operations, transactions, and unique roll-number locks are fully functional right now in the applet preview!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>Step-by-Step Instructions to Connect Your Firebase Project:</span>
            </h3>
            <ol className="space-y-3 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
              <li className="pl-1">
                <span className="font-semibold">Create a Firebase Project:</span> Go to the{' '}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and click <strong>Add project</strong>.
              </li>
              <li className="pl-1">
                <span className="font-semibold">Create Cloud Firestore:</span> In the left sidebar, navigate to <strong>Build &gt; Firestore Database</strong>, click <strong>Create database</strong>, and select a region (e.g. <em>us-central1</em>).
              </li>
              <li className="pl-1">
                <span className="font-semibold">Generate Service Account Key:</span> Go to <strong>Project Settings</strong> (gear icon) &gt; <strong>Service accounts</strong> tab &gt; click <strong>Generate new private key</strong>. A JSON file will download.
              </li>
              <li className="pl-1">
                <span className="font-semibold">Add Environment Variables:</span> Create or edit your <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">.env</code> file (or AI Studio Settings Secrets) with the credentials from that JSON file:
              </li>
            </ol>
          </div>

          {/* Code block for .env */}
          <div className="relative">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 text-slate-300 text-xs rounded-t-xl font-mono">
              <span>.env</span>
              <button
                id="copy-env-sample-btn"
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-100 text-xs font-mono rounded-b-xl overflow-x-auto whitespace-pre leading-relaxed">
              {envSample}
            </pre>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Unique Roll Number Lock:</p>
            <p>
              The backend automatically enforces roll number uniqueness using atomic Firestore transactions on the <code className="font-mono bg-slate-200/70 px-1 py-0.5 rounded">roll_numbers</code> lock collection and <code className="font-mono bg-slate-200/70 px-1 py-0.5 rounded">students</code> collection.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            id="firebase-modal-done-btn"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
