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
    let res;
    try {
      const response = await api.post(
        "/method/login",
        qs.stringify({ usr, pwd }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      console.log("Login Response Data:", response.data);
      if (response.status === 200) {
        try {
          const username = response.data.name; // This is the newly created user's name/email

          const roleResponse = await api.get(
            `/resource/User?filters=[["full_name","=","${username}"]]&fields=["full_name","roles"]`
          );
          res = roleResponse;
          console.log(res, "result");
          const userRoles = roleResponse.data.data[0]?.roles || [];
        } catch (error) {
          console.error("Error fetching user roles:", error);
        }
      }
      const responseData = { response: response.data, role: res };
      console.log(responseData);
      return responseData;
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
  // listOrder: async () => {
  //   const response = await api.get(`/resource/Sales Order?fields=["items"] `);

  //   return response.data;
  // },

  createOrder: async (body: {
    customer: string;
    waiter: string;
    item_code: string;
    qty: number;
    amount: number;
    rate: number;
    deliver_date: string;
  }) => {
    const formattedBody = {
      customer: body.customer,
      transaction_date: new Date().toISOString().split("T")[0],
      delivery_date: body.deliver_date,
      items: [
        {
          item_code: body.item_code,
          qty: body.qty,
          rate: body.rate ?? 0,
          warehouse: "Finished Goods - RLRD",
        },
      ],
      custom_waiter: body.waiter,
    };
    console.log(formattedBody, "data to  be sent");
    const response = await api.post("/resource/Sales Order", formattedBody);
    return response.data;
  },
};

export default api;
