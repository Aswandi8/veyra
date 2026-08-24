"use client";

import { Copy, ExternalLink, Share2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShortLinkShareProps {
  url: string;
  title?: string | null;
  description?: string | null;
  disabled?: boolean;
}

interface ShortLinkShareMenuItemsProps extends ShortLinkShareProps {
  showNativeShare?: boolean;
  showCopy?: boolean;
}

function openShareUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function getShareData({
  url,
  title,
  description,
}: Pick<ShortLinkShareProps, "url" | "title" | "description">) {
  const shareTitle = title?.trim() || "ShortLink";
  const shareText = description?.trim() || shareTitle;

  return {
    shareTitle,
    shareText,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`,
    facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    xUrl: `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
  };
}

export function ShortLinkShareMenuItems({
  url,
  title,
  description,
  disabled = false,
  showNativeShare = true,
  showCopy = true,
}: ShortLinkShareMenuItemsProps) {
  const unavailable = disabled || !url;
  const shareData = getShareData({ url, title, description });

  async function handleNativeShare() {
    if (unavailable) return;

    if (typeof navigator.share !== "function") {
      toast.error("Native sharing is not available in this browser.");
      return;
    }

    try {
      await navigator.share({
        title: shareData.shareTitle,
        text: shareData.shareText,
        url,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      console.error("[SHORTLINK NATIVE SHARE]", error);
      toast.error("Unable to open the share menu.");
    }
  }

  async function handleCopy() {
    if (unavailable) return;

    try {
      await copyText(url);
      toast.success("ShortLink copied.");
    } catch (error) {
      console.error("[SHORTLINK COPY]", error);
      toast.error("Unable to copy ShortLink.");
    }
  }

  return (
    <>
      {showNativeShare ? (
        <DropdownMenuItem disabled={unavailable} onClick={handleNativeShare}>
          <Smartphone className="size-4" />
          Share with device
        </DropdownMenuItem>
      ) : null}

      <DropdownMenuItem
        disabled={unavailable}
        onClick={() => openShareUrl(shareData.whatsappUrl)}
      >
        <ExternalLink className="size-4" />
        WhatsApp
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled={unavailable}
        onClick={() => openShareUrl(shareData.facebookUrl)}
      >
        <ExternalLink className="size-4" />
        Facebook
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled={unavailable}
        onClick={() => openShareUrl(shareData.xUrl)}
      >
        <ExternalLink className="size-4" />X
      </DropdownMenuItem>

      <DropdownMenuItem
        disabled={unavailable}
        onClick={() => openShareUrl(shareData.telegramUrl)}
      >
        <ExternalLink className="size-4" />
        Telegram
      </DropdownMenuItem>

      {showCopy ? (
        <>
          <DropdownMenuSeparator />

          <DropdownMenuItem disabled={unavailable} onClick={handleCopy}>
            <Copy className="size-4" />
            Copy Link
          </DropdownMenuItem>
        </>
      ) : null}
    </>
  );
}

export function ShortLinkCopyButton({
  url,
  disabled = false,
}: Pick<ShortLinkShareProps, "url" | "disabled">) {
  const unavailable = disabled || !url;

  async function handleCopy() {
    if (unavailable) return;

    try {
      await copyText(url);
      toast.success("ShortLink copied.");
    } catch (error) {
      console.error("[SHORTLINK COPY]", error);
      toast.error("Unable to copy ShortLink.");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={unavailable}
      onClick={handleCopy}
    >
      <Copy className="size-4" />
      Copy Link
    </Button>
  );
}

export function ShortLinkShareButton({
  url,
  title,
  description,
  disabled = false,
}: ShortLinkShareProps) {
  const unavailable = disabled || !url;

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={unavailable}
          render={<Button type="button" disabled={unavailable} />}
        >
          <Share2 className="size-4" />
          Share
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Share ShortLink</DropdownMenuLabel>

            <ShortLinkShareMenuItems
              url={url}
              title={title}
              description={description}
              disabled={disabled}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShortLinkCopyButton url={url} disabled={disabled} />
    </div>
  );
}
