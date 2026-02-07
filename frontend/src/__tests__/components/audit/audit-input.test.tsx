import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuditInput } from "@/components/audit/audit-input";

describe("AuditInput", () => {
  it("should render input and button", () => {
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    expect(
      screen.getByPlaceholderText("Enter your company name or website"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /scan your brand/i }),
    ).toBeInTheDocument();
  });

  it("should call onSubmit when button is clicked with valid input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );
    const button = screen.getByRole("button", { name: /scan your brand/i });

    await user.type(input, "Acme Corp");
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledWith("Acme Corp");
  });

  it("should submit on Enter key press", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );

    await user.type(input, "Test Company{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("Test Company");
  });

  it("should not submit when input is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const button = screen.getByRole("button", { name: /scan your brand/i });
    await user.click(button);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should not submit when input contains only whitespace", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );
    const button = screen.getByRole("button", { name: /scan your brand/i });

    await user.type(input, "   ");
    await user.click(button);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should trim whitespace from input before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );
    const button = screen.getByRole("button", { name: /scan your brand/i });

    await user.type(input, "  Acme Corp  ");
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledWith("Acme Corp");
  });

  it("should disable input and button when loading", async () => {
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} isLoading={true} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );
    const button = screen.getByRole("button", { name: /scan your brand/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("should not call onSubmit when loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} isLoading={true} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );

    // Try to type and submit
    await user.type(input, "Test{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should disable button when input is empty even after typing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );
    const button = screen.getByRole("button", { name: /scan your brand/i });

    // Type something then delete it
    await user.type(input, "Test");
    await user.clear(input);

    expect(button).toBeDisabled();
  });

  it("should enable button when valid input is entered", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuditInput onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(
      "Enter your company name or website",
    );
    const button = screen.getByRole("button", { name: /scan your brand/i });

    await user.type(input, "Acme Corp");

    expect(button).not.toBeDisabled();
  });
});
