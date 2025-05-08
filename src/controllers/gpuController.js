const gpuService = require('../services/gpuService');
const logger = require('../utils/logger');

class GpuController {
    async getAllGpus(req, res) {
        try {
            const filters = {
                brand: req.query.brand,
                retailer: req.query.retailer,
                model: req.query.model,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
                inStock: req.query.inStock === 'true' ? true : undefined
            };

            const gpus = await gpuService.getAllGpus(filters);
            res.json(gpus);
        } catch (error) {
            logger.error('Fejl i getAllGpus controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved hentning af GPU\'er' 
            });
        }
    }

    async getGpuById(req, res) {
        try {
            const gpu = await gpuService.getGpuById(req.params.id);
            if (!gpu) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'GPU ikke fundet' 
                });
            }
            res.json(gpu);
        } catch (error) {
            logger.error('Fejl i getGpuById controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved hentning af GPU' 
            });
        }
    }

    async getRetailers(req, res) {
        try {
            const retailers = await gpuService.getRetailers();
            res.json(retailers);
        } catch (error) {
            logger.error('Fejl i getRetailers controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved hentning af forhandlere' 
            });
        }
    }

    async getBrands(req, res) {
        try {
            const brands = await gpuService.getBrands();
            res.json(brands);
        } catch (error) {
            logger.error('Fejl i getBrands controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved hentning af brands' 
            });
        }
    }

    async getModels(req, res) {
        try {
            const models = await gpuService.getModels();
            res.json(models);
        } catch (error) {
            logger.error('Fejl i getModels controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved hentning af modeller' 
            });
        }
    }
}

module.exports = new GpuController();
