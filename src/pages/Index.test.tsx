import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import Index from "./Index";

// Mock all components to isolate page-level tests
vi.mock("@/components/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock("@/components/Hero", () => ({
  default: () => <section data-testid="hero">Hero</section>,
}));

vi.mock("@/components/About", () => ({
  default: () => <section data-testid="about">About</section>,
}));

vi.mock("@/components/Sponsors", () => ({
  default: () => <section data-testid="sponsors">Sponsors</section>,
}));

vi.mock("@/components/Registration", () => ({
  default: () => <section data-testid="registration">Registration</section>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock("@/components/SEO", () => ({
  default: () => null,
}));

vi.mock("@/components/StructuredData", () => ({
  default: () => null,
}));

describe("Index Page", () => {
  it("should render all main sections", async () => {
    render(<Index />);
    expect(await screen.findByTestId("navbar")).toBeInTheDocument();
    expect(await screen.findByTestId("hero")).toBeInTheDocument();
    expect(await screen.findByTestId("about")).toBeInTheDocument();
    expect(await screen.findByTestId("sponsors")).toBeInTheDocument();
    expect(await screen.findByTestId("registration")).toBeInTheDocument();
    expect(await screen.findByTestId("footer")).toBeInTheDocument();
  });

  it("should have main element", () => {
    const { container } = render(<Index />);
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("should have minimum height styling", () => {
    const { container } = render(<Index />);
    const wrapper = container.querySelector(".min-h-screen");
    expect(wrapper).toBeInTheDocument();
  });
});

