const { QueryTypes } = require('sequelize')
let db = require('../models/index')
let { sequelize, Op } = require('../models/index')

let create = async(data) => {
    try {
        await sequelize.query(`INSERT INTO Group_Chats (name, members, image, leader, deputy)
        VALUES (:name, :members, :image, :leader, :deputy)`, {
            replacements :{
                name : data.name,
                members : data.members,
                image : data.image ? data.image : "https://s3-dynamodb-cloudfront-20040331.s3.ap-southeast-1.amazonaws.com/2own-1712558751796--IMG_0007.jpg",
                leader : data.leader,
                deputy : data.deputy ? data.deputy : null
            },
            type : QueryTypes.INSERT
        })
        return await findByNameAndLeader(data.name, data.leader)
    } catch (error) {
        return false
    }
}

let findAll = async() => {
    try {
        let datas = await db.GroupChat.findAll({
            attributes : ['id', 'name', 'members', 'leader', 'deputy']
        })
        return datas
    } catch (error) {
        return null
    }
}

let findById = async(id) => {
    try {
        let data = await db.GroupChat.findOne({
            attributes : ['id', 'name', 'members', 'leader', 'deputy'],
            where : {
                id : id
            }
        })
        return data.dataValues
    } catch (error) {
        return null
    }
}

let findByNameAndLeader = async(name, leader) => {
    try {
        let data = await sequelize.query(
            `
            SELECT * FROM Group_Chats WHERE name = :name AND leader = :leader
            `,
            {
              replacements: {
                name: name,
                leader : Number(leader)
              },
              type: QueryTypes.SELECT,
            }
          );
        return data[0]
    } catch (error) {
        return null
    }
}

let deleteById = async(id) => {
    try {
        await db.GroupChat.destroy({
            where : {
                id : id
            }
        })
        return true
    } catch (error) {
        return false
    }
}

let getApiChatBetweenGroup = async (groupId, page) => {
    try {
      let datas = await sequelize.query(
        `
        SELECT c.*,gr.name AS nameGroup,gr.image AS imageGroup,gr.members, u.name,u.image AS imageUser,
            IF(FIND_IN_SET(c.id, (SELECT GROUP_CONCAT(st.chat SEPARATOR ',') FROM Status_Chat AS st WHERE st.status = 'recalls')) > 0, TRUE, FALSE) AS isRecalls 
        FROM Chats AS c INNER JOIN Group_Chats AS gr ON gr.id = c.groupChat INNER JOIN Users AS u ON u.id = c.sender
        WHERE c.groupChat = :groupId
        AND c.dateTimeSend NOT IN (
            SELECT c1.dateTimeSend 
            FROM Chats AS c1
            INNER JOIN Status_Chat AS stc ON c1.id = stc.chat
            WHERE c1.groupChat = :groupId
        ) 
        AND c.id IN (
            SELECT c2.id 
            FROM (
                SELECT id 
                FROM Chats 
                WHERE groupChat = :groupId
                ORDER BY dateTimeSend DESC 
                LIMIT :page
            ) AS c2
        )
        ORDER BY dateTimeSend ASC;
        `,
        {
          replacements: {
            groupId: groupId,
            page : Number(page)
          },
          type: QueryTypes.SELECT,
        }
      );
      return datas;
    } catch (error) {
      return null;
    }
  };

module.exports = {
    create,
    findAll,
    findById,
    deleteById,
    getApiChatBetweenGroup,
}