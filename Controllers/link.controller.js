const logger = require('../utils/logger');
const linksModel = require('../models/link.model');


// =======================
// ✅ Health Check
// =======================
exports.healthCheck = async (req, res, next) => {
  try {
    console.log('🚀 NEW HEALTH FUNCTION CALLED');
    logger.info('Health check API called');

    // ✅ Server uptime
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    // ✅ Correct DB health call
    const dbHealth = await linksModel.getDbHealth();

    return res.status(200).json({
      ok: true,
      status: 'Server is healthy',
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      timestamp: new Date(),
      database: dbHealth
    });

  } catch (error) {
    logger.error('Health check failed', { error: error.message });

    return res.status(500).json({
      ok: false,
      status: 'Server unhealthy'
    });
  }
};


// =======================
// ✅ Create Short Link
// =======================
exports.createLink = async (req, res, next) => {
  try {
    logger.info('createLink called');

    const { longUrl, customCode } = req.body;

    if (!longUrl) {
      return next(new AppError('longUrl is required', 400));
    }

    const code = customCode || Math.random().toString(36).substring(2, 8);

    const existing = await linksModel.checkCode(code);
    if (existing.length > 0) {
      return next(new AppError('Code already exists', 409));
    }

    const saved = await linksModel.createLink(code, longUrl);

    return res.status(201).json({
      code: '00',
      status: 'success',
      message: 'Link created successfully',
      data: saved[0],
      errors: []
    });

  } catch (error) {
    logger.error('createLink error', { error: error.message });
    return next(new AppError('Create failed', 500));
  }
};


// =======================
// ✅ Get All Links
// =======================
exports.getAll = async (req, res, next) => {
  try {
    logger.info('getAll links called');

    const links = await linksModel.getAll();

    return res.status(200).json({
      code: '00',
      status: 'success',
      message: 'Links fetched successfully',
      data: links,
      errors: []
    });

  } catch (error) {
    logger.error('getAll error', { error: error.message });
    return next(new AppError('Fetch failed', 500));
  }
};


// =======================
// ✅ Get Link By Code
// =======================
exports.getLinkByCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const link = await linksModel.getByCode(code);

    if (!link || link.length === 0) {
      return next(new AppError('Link not found', 404));
    }

    return res.status(200).json({
      code: '00',
      status: 'success',
      message: 'Link fetched successfully',
      data: link[0],
      errors: []
    });

  } catch (error) {
    logger.error('getLinkByCode error', { error: error.message });
    return next(new AppError('Fetch failed', 500));
  }
};


// =======================
// ✅ Update Short Code
// =======================
exports.updateLink = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { newCode } = req.body;

    if (!newCode || newCode.length < 6 || newCode.length > 8) {
      return next(new AppError('Invalid code length', 400));
    }

    const exists = await linksModel.checkCode(newCode);
    if (exists.length > 0) {
      return next(new AppError('Code already exists', 409));
    }

    const updated = await linksModel.updateCode(code, newCode);

    return res.status(200).json({
      code: '00',
      status: 'success',
      message: 'Link updated successfully',
      data: updated[0],
      errors: []
    });

  } catch (error) {
    logger.error('updateLink error', { error: error.message });
    return next(new AppError('Update failed', 500));
  }
};


// =======================
// ✅ Delete Link
// =======================
exports.deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await linksModel.deleteById(id);

    if (!deleted) {
      return next(new AppError('Link not found', 404));
    }

    return res.status(200).json({
      code: '00',
      status: 'success',
      message: 'Link deleted successfully',
      data: null,
      errors: []
    });

  } catch (error) {
    logger.error('deleteLink error', { error: error.message });
    return next(new AppError('Delete failed', 500));
  }
};


// =======================
// ✅ Global Stats
// =======================
exports.stats = async (req, res, next) => {
  try {
    logger.info('stats called');

    const stats = await linksModel.getStats();

    return res.status(200).json({
      totalLinks: Number(stats.totalLinks[0].count),
      totalClicks: Number(stats.totalClicks[0].coalesce)
    });

  } catch (error) {
    logger.error('stats error', { error: error.message });
    return next(new AppError('Stats failed', 500));
  }
};

// =======================
// ✅ Redirect (Important)
// =======================
exports.redirect = async (req, res) => {
  const { code } = req.params;

  try {
    const link = await linksModel.getByCode(code);

    if (!link || link.length === 0) {
      return res.status(404).send('Link not found');
    }

    // update click count
    await linksModel.trackClick(code);

    // ✅ FORCE REAL REDIRECT
    return res.redirect(302, link[0].long_url);

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};


