import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "../../pages/Register";
import api from "../../services/api";
import "@testing-library/jest-dom";

jest.mock("../../services/api", () => ({
  post: jest.fn(),
}));

jest.mock("./../../utils/helpers", () => ({
  useAppTranslation: () => (key) => {
    const translations = {
      "auth.register.title": "Register",
      "auth.register.name_placeholder": "Name",
      "auth.register.email_placeholder": "Email",
      "auth.register.password_placeholder": "Password",
      "auth.register.error": "All fields are required.",
      "auth.register.success": "Account created successfully! Please log in.",
      "auth.register.button": "Register",
    };
    return translations[key] || key;
  },
}));

describe("Register Component", () => {
  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.clearAllMocks(); 
  });

  it("calls the API with the correct data", async () => {
    const mockResponse = { data: { message: "Account created successfully! Please log in." } };
    api.post.mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "securepassword");

    const registerButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(registerButton);

    expect(api.post).toHaveBeenCalledWith("/users/", {
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
    });

    expect(window.alert).toHaveBeenCalledWith("Account created successfully! Please log in.");
  });

  it("does not call the API if fields are empty", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/password/i)).toHaveValue("");

    const registerButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(registerButton);

    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();

    expect(api.post).not.toHaveBeenCalled();
  });
});
