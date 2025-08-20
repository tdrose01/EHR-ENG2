export function validateFredInput(req, res, next) {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (description && typeof description !== 'string') {
    return res.status(400).json({ error: 'Invalid description' });
  }
  next();
}
