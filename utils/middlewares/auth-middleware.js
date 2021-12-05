const jwt = require('jsonwebtoken');
const db = require('../../models/index');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    const token = authHeader.split(' ');
    if (!token || token.length < 2) {
      return res.status(401).json({ errors: ['Invalid Token'] });
    }

    const decoded = jwt.verify(token[1], process.env.JWT_PRIVATE_KEY);

    const tokenCheck = await db.LoginHistory.findOne({ where: { id: decoded.id, status: 'active' } });
    if (!tokenCheck) {
      return res.status(401).json({ errors: ['Invalid Token'] });
    }
    req.userId = tokenCheck.userId;
    req.loginId = tokenCheck.id;
  } catch (err) {
    return res.status(401).json({ errors: ['Invalid Token'] });
  }

  return next();
};
