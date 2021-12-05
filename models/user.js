const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    // define association here
    // }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.INTEGER(1),
    password: DataTypes.STRING,
    displayPicture: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });

  User.prototype.toJSON = function toJSON() {
    const values = { ...this.get() };

    delete values.password;
    return values;
  };

  return User;
};
