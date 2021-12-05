const {
  Model,
} = require('sequelize');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    // define association here
    // }
  }
  LoginHistory.init({
    userId: DataTypes.INTEGER,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'LoginHistory',
  });

  LoginHistory.createToken = async (userId) => {
    const history = await LoginHistory.create({ userId, status: 'active' });
    const token = jwt.sign({ id: history.id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '5h' });
    return token;
  };

  return LoginHistory;
};
