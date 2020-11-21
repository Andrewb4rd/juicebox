const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "juicebox_dev",
  password: "2112",
  port: 5432,
});

async function createUser({ username, password, name, location }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
      `,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active 
      FROM users;
    `
  );
  return rows;
}

async function getAllPosts() {
  const { rows } = await client.query(
    `SELECT id,
        title,
        content,
        active
          FROM posts;
        `
  );

  return rows;
}

async function createPost({ authorId, title, content }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
            INSERT INTO posts("authorId", title, content) 
            VALUES($1, $2, $3) 
            RETURNING *;
            `,
      [authorId, title, content]
    );

    return post;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
          UPDATE users
          SET ${setString}
          WHERE id=${id}
          RETURNING *;
        `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [post],
    } = await client.query(
      `
              UPDATE posts
              SET ${setString}
              WHERE id=${id}
              RETURNING *;
            `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${userId};
      `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  const { rows } = await client.query(`
  SELECT * FROM users
  WHERE id=${userId};
        `);

  if (rows) {
    let userObj = rows[0];
    delete userObj.password;
    const posts = await getPostsByUser(userObj.id);
    console.log("USER OBJBJBJ", userObj);
    console.log(posts);
    userObj.posts = posts;
    return userObj;
  } else {
    return null;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getUserById,
};
