const connection = require('../config/db');
const helper = require('./helper');


const getProduct = async (req, res, productId) => {
    try {
        let query = `select product_id, title, description, weight_kilos, brand 
                            from Product
                            where product_id = $1`;
        let values = [productId];
        const out = await connection.query(query, values);
        if (out.rows.length === 0) throw Error('No such product');
        const result = out.rows[0];

        query = `select attribute_name as key, attribute_value as value 
        from ProductAttribute
        where product_id = $1`;
        values = [productId];
        const outAttributes = await connection.query(query, values);
        result.attributes = outAttributes.rows;
        return result;
    } catch (err) {
        helper.errorResponse(res, err.message);
        return null;
    }
};


const getProductsFromCategory = async (req, res, categoryId) => {
    try {
        const query = `select product_id, title, min_selling_price, image_url 
                            from ProductBasicView natural join ProductCategory
                            where category_id = $1 
                            order by min_selling_price 
                            limit 99`;
        const values = [categoryId];
        const out = await connection.query(query, values);
        const result = out.rows.map((el) => {
            const o = { ...el };
            o.id = o.product_id;
            o.show = true;
            o.price = o.min_selling_price - 0;
            o.image = o.image_url;
            return o;
        });
        return { result, topprice: result.length === 0 ? 10000 : result[result.length - 1].price };
    } catch (err) {
        helper.errorResponse(res, err.message);
        return null;
    }
};

const getProductsFromQuery = async (req, res, searchQuery) => {
    try {
        const query = `select product_id, title, min_selling_price, image_url 
                            from ProductBasicView
                            where title like $1
                            order by min_selling_price 
                            limit 99`;
        const values = [
            `%${searchQuery
                .replace('!', '!!')
                .replace('%', '!%')
                .replace('_', '!_')
                .replace('[', '![')}%`];

        const out = await connection.query(query, values);
        const result = out.rows.map((el) => {
            const o = { ...el };
            o.id = o.product_id;
            o.show = true;
            o.price = o.min_selling_price - 0;
            o.image = o.image_url;
            return o;
        });
        return { result, topprice: result.length === 0 ? 10000 : result[result.length - 1].price };
    } catch (err) {
        helper.errorResponse(res, err.message);
        return null;
    }
};


const getVariants = async (req, res, productId) => {
    try {
        let query = `select variant_id, quantity, title, selling_price, listed_price
                            from Variant
                            where product_id = $1`;
        const values = [productId];
        const out = await connection.query(query, values);
        const result = out.rows.map((el) => {
            const o = { ...el };
            o.id = o.variant_id;
            o.price = o.selling_price - 0;
            o.old_price = o.listed_price;
            o.amount = o.quantity;
            return o;
        });

        query = `select variant_id, attribute_name as key, attribute_value as value
                            from VariantAttribute natural join Variant
                            where product_id = $1`;
        const outAtrribs = await connection.query(query, values);
        return { result, attributes: outAtrribs.rows };
    } catch (err) {
        helper.errorResponse(res, err.message);
        return null;
    }
};

module.exports = {
    getProduct, getProductsFromCategory, getProductsFromQuery, getVariants,
};