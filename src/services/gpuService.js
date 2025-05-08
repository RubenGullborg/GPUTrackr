const Gpu = require('../models/gpu');
const logger = require('../utils/logger');

class GpuService {
    async getAllGpus(filters = {}) {
        try {
            const query = {};
            
            if (filters.brand) query.brand = filters.brand;
            if (filters.retailer) query.retailer = filters.retailer;
            if (filters.model) query.model = { $regex: filters.model, $options: 'i' };
            if (filters.minPrice) query.currentPrice = { $gte: filters.minPrice };
            if (filters.maxPrice) query.currentPrice = { ...query.currentPrice, $lte: filters.maxPrice };
            if (filters.inStock !== undefined) query.inStock = filters.inStock;

            return await Gpu.find(query).sort({ currentPrice: 1 });
        } catch (error) {
            logger.error('Fejl ved hentning af GPU\'er:', error);
            throw error;
        }
    }

    async getGpuById(id) {
        try {
            return await Gpu.findById(id);
        } catch (error) {
            logger.error(`Fejl ved hentning af GPU med ID ${id}:`, error);
            throw error;
        }
    }

    async getRetailers() {
        try {
            return await Gpu.distinct('retailer');
        } catch (error) {
            logger.error('Fejl ved hentning af forhandlere:', error);
            throw error;
        }
    }

    async getBrands() {
        try {
            return await Gpu.distinct('brand');
        } catch (error) {
            logger.error('Fejl ved hentning af brands:', error);
            throw error;
        }
    }

    async getModels() {
        try {
            return await Gpu.distinct('model');
        } catch (error) {
            logger.error('Fejl ved hentning af modeller:', error);
            throw error;
        }
    }
}

module.exports = new GpuService();
