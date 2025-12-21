import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { trackSocialShare } from "@/lib/analytics";

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  className?: string;
  variant?: "default" | "compact" | "icon-only";
}

const SocialShare = ({ 
  title = "JengaHacks 2026 - East Africa's Premier Hackathon",
  description = "Join us for 48 hours of innovation, collaboration, and building solutions that matter. February 21-22, 2026 at iHub, Nairobi.",
  url,
  className = "",
  variant = "default"
}: SocialShareProps) => {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://jengahacks.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = async (platform: string, link: string) => {
    // Try native Web Share API first (mobile)
    if (navigator.share && platform === "native") {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error, fall through to copy link
        if ((error as Error).name !== "AbortError") {
          console.error("Share error:", error);
        }
      }
    }

    // Copy to clipboard for native share or link copy
    if (platform === "copy" || platform === "native") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        trackSocialShare(platform === "copy" ? "copy_link" : "native_share", "event");
        toast.success("Link copied to clipboard!");
        return;
      } catch (error) {
        console.error("Copy error:", error);
        toast.error("Failed to copy link");
        return;
      }
    }

    // Track social share
    const platformName = link.includes("twitter") ? "twitter" :
                         link.includes("facebook") ? "facebook" :
                         link.includes("linkedin") ? "linkedin" :
                         link.includes("wa.me") ? "whatsapp" : platform;
    trackSocialShare(platformName, "event");

    // Open share link in new window
    window.open(link, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  if (variant === "icon-only") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("native", "")}
          className="h-9 w-9"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("twitter", shareLinks.twitter)}
          className="h-9 w-9 hover:bg-blue-500/10 hover:text-blue-500"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("facebook", shareLinks.facebook)}
          className="h-9 w-9 hover:bg-blue-600/10 hover:text-blue-600"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("linkedin", shareLinks.linkedin)}
          className="h-9 w-9 hover:bg-blue-700/10 hover:text-blue-700"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
          className="h-9 w-9 hover:bg-green-500/10 hover:text-green-500"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("copy", "")}
          className="h-9 w-9"
          aria-label="Copy link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Share:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter", shareLinks.twitter)}
          className="h-8"
        >
          <Twitter className="h-3 w-3 mr-1.5" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook", shareLinks.facebook)}
          className="h-8"
        >
          <Facebook className="h-3 w-3 mr-1.5" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin", shareLinks.linkedin)}
          className="h-8"
        >
          <Linkedin className="h-3 w-3 mr-1.5" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
          className="h-8"
        >
          <MessageCircle className="h-3 w-3 mr-1.5" />
          WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Share2 className="h-4 w-4" />
        <span>Share this event</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter", shareLinks.twitter)}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4" />
          <span>Twitter</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook", shareLinks.facebook)}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4" />
          <span>Facebook</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("linkedin", shareLinks.linkedin)}
          className="flex items-center gap-2"
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp", shareLinks.whatsapp)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("copy", "")}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          <span>Copy Link</span>
        </Button>
      </div>
    </div>
  );
};

export default SocialShare;

