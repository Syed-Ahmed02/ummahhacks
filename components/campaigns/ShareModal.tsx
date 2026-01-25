"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Copy, Share2, Mail, MessageCircle, Link as LinkIcon } from "lucide-react";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  url: string;
};

export function ShareModal({ open, onClose, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(url);
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedUrl}`,
    email: `mailto:?subject=Please support this campaign&body=${encodedUrl}`,
  } as const;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Help by sharing</h2>
            <p className="mt-1 text-muted-foreground">
              Fundraisers shared on social networks raise up to 5x more. Share your unique link below
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm font-medium mb-2">Copy link</p>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white text-slate-700 border">
                <LinkIcon className="size-5" />
              </div>
              <input
                readOnly
                value={url}
                className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
              />
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                {copied ? <Copy className="size-4" /> : <Share2 className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            <Button variant="outline" className="justify-start gap-3" onClick={() => openShare("facebook")}> 
              <Share2 className="size-4 text-blue-600" />
              Facebook
            </Button>
            <Button variant="outline" className="justify-start gap-3" onClick={() => openShare("whatsapp")}>
              <MessageCircle className="size-4 text-green-600" />
              WhatsApp
            </Button>
            <Button variant="outline" className="justify-start gap-3" onClick={() => openShare("email")}> 
              <Mail className="size-4" />
              Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
