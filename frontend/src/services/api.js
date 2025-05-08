import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const gpuApi = {
  getAllGpus: async (filters = {}) => {
    const response = await api.get("/gpus", { params: filters });
    return response.data;
  },

  getBrands: async () => {
    const response = await api.get("/gpus/brands");
    return response.data;
  },

  getRetailers: async () => {
    const response = await api.get("/gpus/retailers");
    return response.data;
  },

  getModels: async () => {
    const response = await api.get("/gpus/models");
    return response.data;
  },

  scrapeProduct: async (url) => {
    const response = await api.get("/scrape/product", { params: { url } });
    return response.data;
  },
};
