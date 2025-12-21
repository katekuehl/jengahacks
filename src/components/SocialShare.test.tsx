import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import SocialShare from "./SocialShare";

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, "open", {
  writable: true,
  value: mockOpen,
});

describe("SocialShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpen.mockClear();
  });

  it("should render default variant", () => {
    render(<SocialShare />);
    expect(screen.getByText("Share this event")).toBeInTheDocument();
    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  it("should render compact variant", () => {
    render(<SocialShare variant="compact" />);
    expect(screen.getByText("Share:")).toBeInTheDocument();
    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
  });

  it("should render icon-only variant", () => {
    render(<SocialShare variant="icon-only" />);
    expect(screen.getByLabelText("Share")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Twitter")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Share on WhatsApp")).toBeInTheDocument();
    expect(screen.getByLabelText("Copy link")).toBeInTheDocument();
  });

  it("should open Twitter share link when clicked", () => {
    render(<SocialShare variant="compact" />);
    
    const twitterButton = screen.getByText("Twitter");
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com/intent/tweet"),
      "_blank",
      expect.any(String)
    );
  });

  it("should use custom URL when provided", () => {
    const customUrl = "https://example.com/custom";
    render(<SocialShare url={customUrl} variant="compact" />);
    
    const twitterButton = screen.getByText("Twitter");
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(customUrl)),
      "_blank",
      expect.any(String)
    );
  });

  it("should use custom title when provided", () => {
    const customTitle = "Custom Event Title";
    render(<SocialShare title={customTitle} variant="compact" />);
    
    const twitterButton = screen.getByText("Twitter");
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(customTitle)),
      "_blank",
      expect.any(String)
    );
  });
});
