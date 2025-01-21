import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/Login";
import api from "../../services/api";
import "@testing-library/jest-dom";

// Mock de la API
jest.mock("../../services/api", () => ({
  post: jest.fn(),
}));

// Mock de Traducción
jest.mock("./../../utils/helpers", () => ({
  useAppTranslation: () => (key) => {
    const translations = {
      "auth.login.title": "Login",
      "auth.login.email_placeholder": "Enter your email",
      "auth.login.email_required": "Email is required",
      "auth.login.password_placeholder": "Enter your password",
      "auth.login.password_required": "Password is required",
      "auth.login.button": "Sign In",
      "auth.login.error": "Invalid email or password.",
    };
    return translations[key] || key;
  },
}));

describe("Login Component", () => {
  beforeEach(() => {
    Storage.prototype.setItem = jest.fn();
    jest.clearAllMocks();
  });

  it("calls the API with the correct data", async () => {
    const mockResponse = { data: { token: "fake-jwt-token" } };
    api.post.mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/Enter your email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/Enter your password/i), "securepassword");

    const loginButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(loginButton);

    expect(api.post).toHaveBeenCalledWith("/users/login", {
      email: "john@example.com",
      password: "securepassword",
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("token", "fake-jwt-token");
  });

  it("shows error message if fields are empty", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(loginButton);

    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();

    // Verificar que la API no fue llamada
    expect(api.post).not.toHaveBeenCalled();
  });

  it("shows error message for invalid credentials", async () => {
    api.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/Enter your email/i), "invalid@example.com");
    await userEvent.type(screen.getByLabelText(/Enter your password/i), "wrongpassword");

    const loginButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(loginButton);

    expect(await screen.findByText(/Invalid email or password./i)).toBeInTheDocument();
  });
});
