const express = require('express');
const router = express.Router();
const gpuController = require('../controllers/gpuController');

router.get('/', gpuController.getAllGpus);
router.get('/retailers', gpuController.getRetailers);
router.get('/brands', gpuController.getBrands);
router.get('/models', gpuController.getModels);
router.get('/:id', gpuController.getGpuById);

module.exports = router;
