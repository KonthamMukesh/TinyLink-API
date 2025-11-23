const sql = require('../config/db');
const logger = require('../utils/logger');

// ✅ Create new link
exports.createLink = async (code, longUrl) => {
  try {
    console.log('🟢 createLink() called:', { code, longUrl });

    const result = await sql`
      INSERT INTO links (code, long_url)
      VALUES (${code.trim()}, ${longUrl.trim()})
      RETURNING *
    `;

    console.log('✅ createLink result:', result);
    return result;

  } catch (err) {
    console.error('❌ createLink error:', err);
    logger.error(`Error in createLink model: ${err.message}`);
    throw err;
  }
};

// ✅ Check if code exists
exports.checkCode = async (code) => {
  try {
    console.log('🟢 checkCode() called:', code);

    const result = await sql`
      SELECT * FROM links WHERE code=${code.trim()}
    `;

    console.log('✅ checkCode result:', result);
    return result;

  } catch (err) {
    console.error('❌ checkCode error:', err);
    throw err;
  }
};

// ✅ Get all links
exports.getAll = async () => {
  try {
    console.log('🟢 getAll() called');

    const result = await sql`
      SELECT * FROM links ORDER BY id DESC
    `;

    console.log('✅ getAll result:', result);
    return result;

  } catch (err) {
    console.error('❌ getAll error:', err);
    throw err;
  }
};

// ✅ Get link by code
exports.getByCode = async (code) => {
  try {
    console.log('🟢 getByCode() called:', code);

    const result = await sql`
      SELECT * FROM links WHERE code=${code.trim()}
    `;

    console.log('✅ getByCode result:', result);
    return result;

  } catch (err) {
    console.error('❌ getByCode error:', err);
    throw err;
  }
};

// ✅ Update short code
exports.updateCode = async (oldCode, newCode) => {
  try {
    console.log('🟢 updateCode() called:', { oldCode, newCode });

    const result = await sql`
      UPDATE links
      SET code=${newCode.trim()}
      WHERE code=${oldCode.trim()}
      RETURNING *
    `;

    console.log('✅ updateCode result:', result);
    return result;

  } catch (err) {
    console.error('❌ updateCode error:', err);
    throw err;
  }
};

// ✅ Delete by ID
exports.deleteById = async (id) => {
  try {
    console.log('🟢 deleteById() called:', id);

    const result = await sql`
      DELETE FROM links WHERE id=${id}
    `;

    console.log('✅ delete result:', result);
    return true;

  } catch (err) {
    console.error('❌ deleteById error:', err);
    throw err;
  }
};

// ✅ Get stats
exports.getStats = async () => {
  try {
    console.log('🟢 getStats() called');

    const totalLinks = await sql`SELECT COUNT(*) FROM links`;
    const totalClicks = await sql`SELECT COALESCE(SUM(clicks),0) FROM links`;

    console.log('✅ stats result:', { totalLinks, totalClicks });

    return {
      totalLinks: Number(totalLinks[0].count),
      totalClicks: Number(totalClicks[0].coalesce)
    };

  } catch (err) {
    console.error('❌ getStats error:', err);
    throw err;
  }
};

// ✅ Track redirect clicks
exports.trackClick = async (code) => {
  try {
    console.log('🟢 trackClick() called:', code);

    await sql`
      UPDATE links
      SET clicks = clicks + 1,
          last_clicked_at = NOW()
      WHERE code=${code.trim()}
    `;

    console.log('✅ trackClick updated');

  } catch (err) {
    console.error('❌ trackClick error:', err);
    throw err;
  }
};
exports.getDbHealth = async () => {
  try {
    const result = await sql`SELECT version() AS version`;

    return {
      status: 'UP',
      version: result[0].version
    };

  } catch (error) {
    return {
      status: 'DOWN',
      version: 'Unavailable'
    };
  }
};
