/// <reference types="node" />
import axios from "axios";
import qs from "qs";

const api = axios.create({
  baseURL: "/api/proxy",
  // process.env.NODE_ENV === "development"
  //   ? "/api/proxy"
  //   : "https://ruelux.k.erpnext.com/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log("[API Request]", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("[API Response]", response.status, response.config.url);
    return response;
  },
  (error) => {
    const isAuthError = error.response?.status === 401;
    const isBrowser = typeof window !== "undefined";
    const pathname = isBrowser ? window.location.pathname : "";

    const isSafeToRedirect =
      pathname !== "/login" &&
      !pathname.startsWith("/.well-known") &&
      !pathname.match(/\.(js|json|css|map|ico|png|jpg|jpeg)$/);

    console.error("[API Error]", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    if (isAuthError && isBrowser && isSafeToRedirect) {
      console.warn("[API] Unauthorized - redirecting to login");
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        pathname
      )}`;
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (usr: string, pwd: string) => {
    try {
      const response = await api.post(
        "/method/login",
        qs.stringify({ usr, pwd }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      console.log("Login Response Data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: async () => {
    const response = await api.post("/method/logout");
    return response.data;
  },
  session: async () => {
    const response = await api.get("/method/frappe.auth.get_logged_user");
    return response.data;
  },
  checkHealth: async () => {
    const response = await api.get("/method/ping");
    return response.data;
  },
};

export const menuAPI = {
  // @ts-ignore

  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    if (file.size == 0) throw Error("Can not upload an empty file");
    const renamedFile = new File(
      [file],
      file.name.replace(/\.jfif$/i, ".jpg"),
      {
        type: "image/jpeg",
      }
    );
    formData.append("file", renamedFile, file.name);
    console.log(renamedFile);
    const response = await api.post("/method/upload_file", formData);

    return response.data.message.file_url;
  },
  addMenuItems: async (body: {
    item_code: string;
    item_name: string;
    item_group: string;
    description: string;
    stock_uom: "Nos";
    valuation_rate: number;
    image?: string;
  }) => {
    const response = await api.post("/resource/Item", body);
    return response.data;
  },
  getMenuItems: async () => {
    const response = await api.get(
      `/resource/Item?fields=["name","item_name","image","description","valuation_rate","item_group","stock_uom"]`
    );

    return response.data;
  },
};
export const orderAPI = {
  listOrder: async () => {
    const response = await api.get(`/resource/Sales Order?fields=["items"] `);

    return response.data;
  },

  // createOrder: async (body :{

  // })
};

export default api;
