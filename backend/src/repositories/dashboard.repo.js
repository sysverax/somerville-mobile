const Booking = require("../models/booking");
const Product = require("../models/product");
const Service = require("../models/service");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Series = require("../models/series");

const getDocumentCountsRepo = async () => {
    const counts = await Promise.all([
        Booking.countDocuments(),
        Product.countDocuments(),
        Service.countDocuments({ 
            $or: [
                { isVariant: true }, 
                { isVariant: false, isParent: false }
            ] 
        }),
        Category.countDocuments(),
        Brand.countDocuments(),
        Series.countDocuments(),
    ]);

    return {
        totalBookings: counts[0],
        totalProducts: counts[1],
        totalServices: counts[2],
        totalCategories: counts[3],
        totalBrands: counts[4],
        totalSeries: counts[5],
    };
};

module.exports = {
    getDocumentCountsRepo,
};
