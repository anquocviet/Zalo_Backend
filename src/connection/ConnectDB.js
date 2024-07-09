const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("zalo", "admin", "anquocviet_203", {
  host: "zalo-maria.cvmsquyg28hk.ap-southeast-1.rds.amazonaws.com",
  dialect: "mariadb",
});

let ConnectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        await sequelize.sync({ force: true}); 
      } catch (error) {
        console.error("Unable to connect to the database:", error);
      }
}

module.exports = {
    ConnectDB
}
