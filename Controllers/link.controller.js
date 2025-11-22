const sql = require('../config/db');

// ✅ Health check
exports.health = async (req, res) => {
  try {
    const db = await sql`SELECT NOW()`;

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    res.json({
      status: '✅ Server is Healthy',
      database: '✅ Neon PostgreSQL Connected',
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      timestamp: new Date()
    });

  } catch (err) {
    res.status(500).json({
      status: '❌ Server Down',
      database: '❌ Database Offline',
      uptime: 'Unavailable'
    });
  }
};


// ✅ Create short link
exports.createLink = async (req, res) => {
  console.log('🔗 Create link API called');
  const { longUrl, customCode } = req.body;
  console.log('📥 Request body:', req.body);

  if (!longUrl) {
    console.log('❌ Missing longUrl');
    return res.status(400).json({ message: 'longUrl required' });
  }

  const code = customCode || Math.random().toString(36).substring(2, 8);
  console.log('🔑 Generated code:', code);

  try {
    const existing = await sql`SELECT * FROM links WHERE code=${code}`;
    console.log('🔍 Existing code check:', existing.length);

    if (existing.length > 0) {
      console.log('❌ Code conflict');
      return res.status(409).json({ message: 'Code already exists' });
    }

    const result = await sql`
      INSERT INTO links (code, long_url)
      VALUES (${code}, ${longUrl})
      RETURNING *;
    `;

    console.log('✅ Link created:', result[0]);
    res.status(201).json(result[0]);
  } catch (err) {
    console.error('❌ Create failed:', err);
    res.status(500).json({ message: 'Create failed' });
  }
};

// ✅ Get all links
exports.getAll = async (req, res) => {
  console.log('📥 Fetch all links');
  try {
    const result = await sql`SELECT * FROM links ORDER BY id DESC`;
    console.log(`✅ Links fetched: ${result.length}`);
    res.json(result);
  } catch (err) {
    console.error('❌ Fetch failed:', err);
    res.status(500).json({ message: 'Fetch failed' });
  }
};

// ✅ Update link
exports.updateLink = async (req, res) => {
  const { code } = req.params;
  const { newCode } = req.body;

  if (!newCode || newCode.length < 6 || newCode.length > 8) {
    return res.status(400).json({ message: 'Invalid code length' });
  }

  try {
    const exist = await sql`SELECT * FROM links WHERE code=${newCode}`;
    if (exist.length > 0) {
      return res.status(409).json({ message: 'Code exists' });
    }

    const result = await sql`
      UPDATE links
      SET code=${newCode}
      WHERE code=${code}
      RETURNING *;
    `;

    res.json(result[0]);

  } catch (err) {
    console.error('❌ DB Error:', err);
    res.status(500).json({ message: 'DB error' });
  }
};


// ✅ Delete link
exports.deleteLink = async (req, res) => {
  const { id } = req.params;
  console.log('🗑️ Delete ID:', id);

  try {
    await sql`DELETE FROM links WHERE id=${id}`;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};


// ✅ Stats
exports.stats = async (req, res) => {
  console.log('📊 Stats API called');

  try {
    const totalLinks = await sql`SELECT COUNT(*) FROM links`;
    const totalClicks = await sql`SELECT COALESCE(SUM(clicks),0) FROM links`;

    console.log('✅ Total Links:', totalLinks[0].count);
    console.log('✅ Total Clicks:', totalClicks[0].coalesce);

    res.json({
      totalLinks: Number(totalLinks[0].count),
      totalClicks: Number(totalClicks[0].coalesce)
    });
  } catch (err) {
    console.error('❌ Stats failed:', err);
    res.status(500).json({ message: 'Stats failed' });
  }
};

// ✅ Redirect + track clicks
// ✅ Redirect + track clicks (FIXED VERSION)
exports.redirect = async (req, res) => {
  const { code } = req.params;

  try {
    const result = await sql`SELECT * FROM links WHERE code=${code}`;

    if (result.length === 0) {
      return res.status(404).send('Link not found');
    }

    // update click count
    await sql`
      UPDATE links 
      SET clicks = clicks + 1,
          last_clicked_at = NOW()
      WHERE code=${code}
    `;

    // ✅ IMPORTANT: REAL REDIRECT
    return res.redirect(302, result[0].long_url);

  } catch (err) {
    res.status(500).send('Server error');
  }
};






exports.getLinkByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const result = await sql`SELECT * FROM links WHERE code=${code}`;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching link' });
  }
};

