const extractPrice = (priceText) => {
    if (!priceText) return 0;
    return parseFloat(priceText.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."));
};

const extractBrand = (name) => {
    const brandRegex = /(ASUS|MSI|Gigabyte|EVGA|Zotac|Palit|Gainward|PNY|Inno3D)/i;
    const brandMatch = name.match(brandRegex);
    return brandMatch ? brandMatch[0] : "Unknown";
};

const extractModel = (name) => {
    const modelRegex = /(RTX\s?\d{4}\s?(?:Ti)?|Radeon\s?RX\s?\d{4}\s?(?:XT)?)/i;
    const modelMatch = name.match(modelRegex);
    return modelMatch ? modelMatch[0] : "Unknown";
};

module.exports = {
    extractPrice,
    extractBrand,
    extractModel
};
