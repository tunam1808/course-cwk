import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth.context";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* 👈 bọc ở đây */}
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
