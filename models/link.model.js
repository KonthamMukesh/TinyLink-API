const sql = require('../config/db');
const logger = require('../utils/logger');

// =======================
// ✅ LINKS MODEL
// =======================

// Create new link
exports.createLink = async (code, longUrl) => {
  try {
    const query = `
      INSERT INTO links (code, long_url)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await sql(query, [code.trim(), longUrl.trim()]);
    logger.info(`✅ Link created: ${code}`);
    return result;

  } catch (err) {
    logger.error(`Error in createLink model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Check if code exists
exports.checkCode = async (code) => {
  try {
    const query = `SELECT * FROM links WHERE code = $1`;
    const result = await sql(query, [code.trim()]);
    return result;

  } catch (err) {
    logger.error(`Error in checkCode model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Get all links
exports.getAll = async () => {
  try {
    const query = `SELECT * FROM links ORDER BY id DESC`;
    const result = await sql(query);
    logger.info(`Fetched all links (${result.length})`);
    return result;

  } catch (err) {
    logger.error(`Error in getAll model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Get link by code
exports.getByCode = async (code) => {
  try {
    const query = `SELECT * FROM links WHERE code = $1`;
    const result = await sql(query, [code.trim()]);
    return result;

  } catch (err) {
    logger.error(`Error in getByCode model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Update short code
exports.updateCode = async (oldCode, newCode) => {
  try {
    const query = `
      UPDATE links
      SET code = $1
      WHERE code = $2
      RETURNING *
    `;

    const result = await sql(query, [newCode.trim(), oldCode.trim()]);
    logger.info(`✅ Code updated: ${oldCode} → ${newCode}`);
    return result;

  } catch (err) {
    logger.error(`Error in updateCode model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Delete by ID
exports.deleteById = async (id) => {
  try {
    const query = `DELETE FROM links WHERE id = $1`;
    const result = await sql(query, [id]);
    logger.info(`🗑️ Deleted link ID: ${id}`);
    return result.count > 0;

  } catch (err) {
    logger.error(`Error in deleteById model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Get stats
exports.getStats = async () => {
  try {
    const totalLinks = await sql(`SELECT COUNT(*) FROM links`);
    const totalClicks = await sql(`SELECT COALESCE(SUM(clicks),0) FROM links`);

    return {
      totalLinks,
      totalClicks
    };

  } catch (err) {
    logger.error(`Error in getStats model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};


// Track click for redirect
exports.trackClick = async (code) => {
  try {
    const query = `
      UPDATE links
      SET clicks = clicks + 1,
          last_clicked_at = NOW()
      WHERE code = $1
    `;

    await sql(query, [code.trim()]);
    logger.info(`📈 Click tracked for: ${code}`);

  } catch (err) {
    logger.error(`Error in trackClick model: ${err.message}`);
    throw new Error(`Database error: ${err.message}`);
  }
};
