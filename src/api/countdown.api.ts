import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export type CountdownState = {
  active: boolean;
  visible: boolean;
  startTime: string | null;
  durationMs: number | null;
};

export type LuckyState = {
  showLuckyNumber: boolean;
};

export const countdownApi = {
  getCountdown: async (): Promise<CountdownState> => {
    const response = await axios.get(`${BASE_URL}/countdown`);
    return response.data;
  },

  updateCountdown: async (data: {
    active: boolean;
    visible: boolean;
    durationMs: number | null;
    resetTimer?: boolean;
  }): Promise<void> => {
    await axios.put(`${BASE_URL}/countdown`, data, authHeader());
  },

  // ─── Lucky Number ───────────────────────────────────────────────────────────
  getLuckySetting: async (): Promise<LuckyState> => {
    const response = await axios.get(`${BASE_URL}/countdown/lucky`);
    return response.data;
  },

  updateLuckySetting: async (showLuckyNumber: boolean): Promise<void> => {
    await axios.put(
      `${BASE_URL}/countdown/lucky`,
      { showLuckyNumber },
      authHeader(),
    );
  },
};
