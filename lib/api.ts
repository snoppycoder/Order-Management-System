/// <reference types="node" />

import { posItem, submittableOrder } from "@/components/pos-interface";
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
  whoAmI: async (email: string) => {
    const response = await api.get(
      `/resource/User/${email}?fields=["name", "roles"]`
    );
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
    price_list_rate: number;
    image?: string;
  }) => {
    const response = await api.post("/resource/Item", body);
    return response.data;
  },
  getInfoMenu: async (menu_id: string) => {
    try {
      const response = await api.get(
        `/resource/Item Add-on?filters=[["linked_item","=",${menu_id}]]`
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
  getMenuItems: async () => {
    // Fetch items and prices
    const [itemsRes, pricesRes, addonRes] = await Promise.all([
      api.get('/resource/Item?fields=["*"]&filters=[["disabled","=","0"]]'),
      api.get(`/resource/Item Price?fields=["*"]`),
      api.get(`/resource/Item Add-on?fields=["*"]`),
    ]);

    const items = itemsRes.data.data;
    const prices = pricesRes.data.data;
    const addons = addonRes.data.data;

    const itemsWithPrices = items.map((item: posItem) => {
      const priceEntry = prices.find(
        (p: { item_code: string }) => p.item_code === item.name
      );

      const addOnsForItem = addons
        .filter((a: { linked_item: string }) => a.linked_item === item.name)
        .map((a: { price: number; add_on_name: string }) => ({
          price: a.price,
          name: a.add_on_name,
        }));

      return {
        ...item,
        itemAddOn: addOnsForItem,
        price_list_rate: priceEntry ? priceEntry.price_list_rate : null,
        price_list: priceEntry ? priceEntry.price_list : null,
      };
    });

    return itemsWithPrices;
  },
};

export const orderAPI = {
  listOrder: async () => {
    const response = await api.get(
      `/resource/Sales Order?fields=["*"]&order_by=creation desc&limit_page_length=100&limit_start=0`
    );

    const orders = response.data.data || [];
    const localItems = JSON.parse(localStorage.getItem("items") || "[]");

    // if (localItems.length > 0 && orders.length > 0) {
    //   const name = orders[0].name;
    //   await api.put(`/resource/Sales Order/${name}`, {
    //     custom_local_items: localItems,
    //   });
    // }
    // localStorage.removeItem("items");

    return orders;
  },
  getOrderDetail: async (ordername: string) => {
    const response = await api.get(
      `/resource/Sales Order/${ordername}?fields=["*"]`
    );
    return response.data;
  },

  createOrder: async (body: submittableOrder) => {
    const items: posItem[] = body.items;
    const reconItems = items.map((item, _) => {
      const { quantity, ...rest } = item;
      return {
        ...rest,
        qty: quantity,
        item_code: item.name,
        warehouse: "Finished Goods - RLRD",
      };
    });

    const formattedBody = {
      custom_customer_name: body.customer,
      // customer: body.customer,
      transaction_date: new Date().toISOString().split("T")[0],
      delivery_date: body.delivery_date,
      items: reconItems,
      custom_waiter: body.waiter,
      custom_table_number: `Table-${body.custom_table_number}`,
      custom_room: body.custom_room,
      custom_order_type: body.order_type,
    };

    const response = await api.post("/resource/Sales Order", formattedBody);
    return response.data;
  },
  updateApprovalDigit: async (ordername: string) => {
    const getResponse = await api.get(`/resource/Sales Order/${ordername}`);
    const currentDigit = getResponse.data.data.custom_approval_digit;
    console.log(currentDigit, "bp");
    const newDigit = currentDigit + 1;

    await api.put(`/resource/Sales Order/${ordername}`, {
      custom_approval_digit: newDigit,
    });

    return {
      success: newDigit >= 2,
      currentDigit: newDigit,
    };
  },
};
export const approvalWorkflow = {
  update: async (status: string, name: string) => {
    try {
      api.put(`/resource/Sales Order/${name}`, {
        workflow_state: status,
      });
    } catch (error) {
      console.log(error);
    }
  },
};

export default api;
