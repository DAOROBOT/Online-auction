exports.getAll = async (req, res) => {
  const { category_id } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;

  if (category_id) {
    sql += ' WHERE p.category_id = ?';
  }

  const rows = category_id
    ? await db.query(sql, [category_id])
    : await db.query(sql);

  res.json(rows);
};



exports.getById = async (req, res) => {
  const { id } = req.params;

  const product = await db.query(
    `SELECT * FROM products WHERE id = ?`,
    [id]
  );

  if (product.length === 0) {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json(product[0]);
};




exports.getRelated = async (req, res) => {
  const { id } = req.params;

  const product = await db.query(
    'SELECT category_id FROM products WHERE id = ?',
    [id]
  );

  const related = await db.query(
    'SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 5',
    [product[0].category_id, id]
  );

  res.json(related);
};