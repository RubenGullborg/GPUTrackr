const express = require('express');
const router = express.Router();
const gpuController = require('../controllers/gpuController');

// Alle GPU'er (med filtrering)
router.get('/', gpuController.getAllGpus);

// Alle tilgængelige modeller
router.get('/models', gpuController.getModels);

// Alle tilgængelige brands
router.get('/brands', gpuController.getBrands);

// Alle tilgængelige forhandlere
router.get('/retailers', gpuController.getRetailers);

// Alle GPU'er af en specifik model
router.get('/model/:modelName', gpuController.getGpusByModel);

// Hent en enkelt GPU - denne skal være SIDST
router.get('/:id', gpuController.getGpuById);

module.exports = router;
