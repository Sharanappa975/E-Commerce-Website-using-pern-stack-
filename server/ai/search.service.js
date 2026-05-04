const pool = require("../config");

const getSemanticResults = async (query) => {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter((word) => word.length > 2);

  if (tokens.length === 0) {
    return [];
  }

  const conditions = [];
  const scoreParts = [];
  const values = [];

  tokens.forEach((token, index) => {
    const param = `%${token}%`;
    const paramIndex = index + 1;
    values.push(param);

    conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
    scoreParts.push(
      `CASE WHEN name ILIKE $${paramIndex} THEN 2 ELSE 0 END + CASE WHEN description ILIKE $${paramIndex} THEN 1 ELSE 0 END`
    );
  });

  const queryText = `
    SELECT *,
      (${scoreParts.join(" + ")}) AS score
    FROM products
    WHERE ${conditions.join(" OR ")}
    ORDER BY score DESC, price ASC
    LIMIT 20
  `;

  const result = await pool.query(queryText, values);
  return result.rows;
};

module.exports = { getSemanticResults };
