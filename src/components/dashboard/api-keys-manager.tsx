'use client';

import { Key, Copy, Check, Trash2, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  lastUsed: string | null;
}

interface NewKeyResult {
  id: string;
  key: string;
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Create key dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // Revoke confirmation dialog
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  // New key reveal dialog
  const [newKeyResult, setNewKeyResult] = useState<NewKeyResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Integration keys
  const [integrationKeys, setIntegrationKeys] = useState({
    exa: '',
    vercel: '',
    resend: '',
  });
  const [savingIntegration, setSavingIntegration] = useState<string | null>(null);
  const [savedIntegration, setSavedIntegration] = useState<string[]>([]);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKeyResult(data);
        setShowCreateDialog(false);
        setNewKeyName('');
        fetchKeys();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevoking(revokeTarget.id);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: revokeTarget.id }),
      });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== revokeTarget.id));
        setRevokeTarget(null);
      }
    } catch {
      // ignore
    } finally {
      setRevoking(null);
    }
  }

  async function handleCopyKey() {
    if (!newKeyResult) return;
    try {
      await navigator.clipboard.writeText(newKeyResult.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleSaveIntegration(key: string, value: string) {
    if (!value.trim()) return;
    setSavingIntegration(key);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSavedIntegration((prev) => [...prev, key]);
        setTimeout(() => setSavedIntegration((prev) => prev.filter((k) => k !== key)), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSavingIntegration(null);
    }
  }

  const integrations = [
    {
      id: 'exa',
      key: 'EXA_API_KEY',
      label: 'Exa API Key (Research)',
      placeholder: 'sk-exa-xxxx',
      help: 'exa.ai',
    },
    {
      id: 'vercel',
      key: 'VERCEL_API_TOKEN',
      label: 'Vercel API Token',
      placeholder: 'xxxx',
      help: 'vercel.com/account/tokens',
    },
    {
      id: 'resend',
      key: 'RESEND_API_KEY',
      label: 'Resend API Key (Email)',
      placeholder: 're_xxxx',
      help: 'resend.com',
    },
  ];

  return (
    <>
      {/* Integration Keys */}
      <div className="space-y-4 mb-6">
        {integrations.map((integration) => (
          <div key={integration.key} className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">{integration.label}</Label>
            <p className="text-[10px] text-zinc-600">Get your key at {integration.help}</p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={integration.placeholder}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
                value={integrationKeys[integration.id as keyof typeof integrationKeys]}
                onChange={(e) =>
                  setIntegrationKeys((prev) => ({
                    ...prev,
                    [integration.id]: e.target.value,
                  }))
                }
              />
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                onClick={() =>
                  handleSaveIntegration(
                    integration.key,
                    integrationKeys[integration.id as keyof typeof integrationKeys]
                  )
                }
                disabled={!!savingIntegration}
              >
                {savedIntegration.includes(integration.key) ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : savingIntegration === integration.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t border-zinc-800 my-4" />

      {/* Custom API Keys */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-100">Custom API Keys</p>
            <p className="text-xs text-zinc-500">
              Create keys for custom integrations and third-party access.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Key
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-800 rounded-lg">
            <Key className="h-8 w-8 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm text-zinc-500">No API keys yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Create a key to get started with integrations.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Key className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{k.name}</p>
                    <p className="text-xs font-mono text-zinc-500 truncate">{k.maskedKey}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600">
                      Created {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                    {k.lastUsed && (
                      <p className="text-[10px] text-zinc-600">
                        Last used {new Date(k.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    onClick={() => setRevokeTarget(k)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Create API Key</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Give your key a descriptive name so you can identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs">Key Name</Label>
            <Input
              placeholder="e.g., Production API, Staging, CI/CD"
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-100"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleCreate}
              disabled={!newKeyName.trim() || creating}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal New Key Dialog */}
      <Dialog
        open={!!newKeyResult}
        onOpenChange={(open) => {
          if (!open) setNewKeyResult(null);
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">API Key Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-200">
                Save this key now — you won&apos;t see it again.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Your API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm font-mono text-zinc-100 break-all">
                  {newKeyResult?.key}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-400 hover:text-zinc-100 shrink-0"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setNewKeyResult(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={!!revokeTarget}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Revoke API Key</DialogTitle>
            <DialogDescription className="text-zinc-500">
              This action cannot be undone. Any services using this key will lose access
              immediately.
            </DialogDescription>
          </DialogHeader>
          {revokeTarget && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium text-zinc-100">{revokeTarget.name}</p>
              <p className="text-xs font-mono text-zinc-500">{revokeTarget.maskedKey}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-100"
              onClick={() => setRevokeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRevoke}
              disabled={!!revoking}
            >
              {revoking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
