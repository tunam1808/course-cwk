import toast from "react-hot-toast";

export const showSuccess = (message: string) => {
  toast.success(message, {
    position: "bottom-left",
    duration: 3000,
    style: {
      background: "#1f2937",
      color: "#fff",
      border: "1px solid #374151",
    },
    iconTheme: {
      primary: "#eab308",
      secondary: "#000",
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    position: "bottom-left",
    duration: 3000,
    style: {
      background: "#1f2937",
      color: "#fff",
      border: "1px solid #374151",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fff",
    },
  });
};
