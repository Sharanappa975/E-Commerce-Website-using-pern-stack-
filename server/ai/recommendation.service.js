const pool = require("../config");

const getRecommendations = async (query) => {
    const q = query.toLowerCase();

    let subcategory = null;
    let priceLimit = null;

    // 💰 PRICE
    const priceMatch = q.match(/\d+/);
    if (priceMatch) {
        priceLimit = parseInt(priceMatch[0]);
    }

    // 🎯 SUBCATEGORY
    if (q.includes("laptop")) subcategory = "laptop";
    else if (q.includes("phone")) subcategory = "phone";
    else if (q.includes("headphone")) subcategory = "headphones";
    else if (q.includes("keyboard")) subcategory = "keyboard";
    else if (q.includes("mouse")) subcategory = "mouse";
    else if (q.includes("hoodie")) subcategory = "hoodie";
    else if (q.includes("jeans")) subcategory = "jeans";
    else if (q.includes("shoes")) subcategory = "shoes";
    else if (q.includes("lamp")) subcategory = "lamp";
    else if (q.includes("chair")) subcategory = "chair";

    // 🔥 FEATURE KEYWORDS (AI BEHAVIOR)
    let feature = null;

    if (q.includes("camera")) feature = "camera";
    else if (q.includes("battery")) feature = "battery";
    else if (q.includes("gaming")) feature = "gaming";
    else if (q.includes("cheap") || q.includes("budget")) feature = "cheap";
    else if (q.includes("premium") || q.includes("best")) feature = "premium";

    let result;

    // 🔥 MAIN QUERY WITH SCORING
    if (subcategory) {
        let queryText = `
            SELECT *,
            CASE
                WHEN description ILIKE $2 THEN 1
                ELSE 2
            END as score
            FROM products
            WHERE subcategory = $1
        `;

        const values = [subcategory];

        // Feature search
        if (feature) {
            values.push(`%${feature}%`);
        } else {
            values.push(`%${q}%`);
        }

        // Price filter
        if (priceLimit) {
            queryText += ` AND price <= $3`;
            values.push(priceLimit);
        }

        queryText += ` ORDER BY score ASC, price ASC LIMIT 10`;

        result = await pool.query(queryText, values);
    } 
    else {
        result = await pool.query(
            `SELECT *
             FROM products
             WHERE name ILIKE $1 OR description ILIKE $1
             ORDER BY price ASC
             LIMIT 10`,
            [`%${q}%`]
        );
    }

    return result.rows;
};

module.exports = { getRecommendations };