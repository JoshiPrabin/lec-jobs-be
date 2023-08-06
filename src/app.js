const express = require("express");

const fs = require("fs");

const cors = require("cors");

const mongoose = require("mongoose");

const app = express();

const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json());

const PORT = 5000;

//connection string
const mongoDbURI = "mongodb://localhost:27017/lec";
mongoose.connect(mongoDbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  username: { type: String, unique: true },
  fullname: String,
  title: String,
  skills: [{ type: String }],
  address: String,
  job_type: String,
  id: Number,
  is_active: Boolean,
  followers: [{ type: String }],
  followings: [{ type: String }],
});

const User = mongoose.model("user", userSchema);

//for posts
const userSchemaposts = new mongoose.Schema({
  title: String,
  email: String,
  username: String,
  password: String,
  description: String,
  location: String,
  job_type: String,
  pay_rate_per_hr_dollar: Number,
  skills: [{ type: String }],
  liked_by: [{ type: String }],
  viewed_by: [{ type: String }],
  id: Number,
  user_id: Number,
  post_by_username: String,
  post_by_fullname: String,
  post_date: String,
  comments: [{ type: String }],
});

const Post = mongoose.model("posts", userSchema);

Post.createCollection()
  .then((col) => {
    console.log("Collection", col, "created");
  })

  .catch((err) => {
    console.log(err);
  });

// Post.create([
//   {
//     title: "PHP Developer Required",
//     description: "For a client project PHP Developer is required",
//     location: "Kathmandu",
//     job_type: "Full Time",
//     pay_rate_per_hr_dollar: 10.0,
//     skills: ["PHP", "JS", "HTML"],
//     liked_by: ["test111", "test1", "test123"],
//     viewed_by: ["test111", "test1", "test123"],
//     id: 2,
//     user_id: 1,
//     post_by_username: "test123",
//     post_by_fullname: "Test User",
//     post_date: "2023-06-10T09:24:07.659034",
//     comments: [],
//   },
//   {
//     title: "Js Developer Required",
//     description: "For a client project PHP Developer is required",
//     location: "Lalitpur",
//     job_type: "Full Time",
//     pay_rate_per_hr_dollar: 10.0,
//     skills: ["PHP", "JS", "HTML"],
//     liked_by: ["test111", "test1", "test123"],
//     viewed_by: ["test111", "test1", "test123"],
//     id: 3,
//     user_id: 2,
//     post_by_username: "test321",
//     post_by_fullname: "Test User2",
//     post_date: "2023-06-10T21:51:10.643105",
//     comments: [],
//   },
//   {
//     title: "Wordpress Developer Required",
//     description: "For a client project PHP Developer is required",
//     location: "Bhaktapur",
//     job_type: "Full Time",
//     pay_rate_per_hr_dollar: 10.0,
//     skills: ["PHP", "JS", "HTML"],
//     liked_by: ["test111", "test1", "test123"],
//     viewed_by: ["test111", "test1", "test123"],
//     id: 4,
//     user_id: 3,
//     post_by_username: "test111",
//     post_by_fullname: "Test User2",
//     post_date: "2023-06-10T21:53:40.698655",
//     comments: [],
//   },
// ]).then(() => {
//   console.log("Posts created");
// });

//http://localhost:5000 or http://localhost:5000/
app.get("/", (req, res) => {
  res.status(200).send("This is response from BE");
});

// read file and send content of file as response
app.get("/api/v1/posts", (req, res) => {
  const posts = fs.readFileSync("./data/posts.json", "utf-8").toString();
  res.status(200).send(posts);
});

app.get("/api/v1/user", async (req, res) => {
  // const user = fs.readFileSync("./data/user.json", "utf-8").toString();
  const user = await User.find({ id: 1 });
  res.status(200).send(user[0]);
});

//login api
app.post("/api/v1/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
    is_active: true,
  });
  if (user) {
    res.status(200).send({ message: "Login successfull" });
  } else {
    res.status(404).send({ error: "Invalid username or password" });
  }
});

app.post("/api/v1/user", async (req, resp) => {
  const lastUser = await User.findOne({}, null, { sort: { id: -1 } });
  const {
    username,
    email,
    fullname,
    title,
    job_type,
    skills,
    address,
    password,
  } = req.body;

  const usernameUser = await User.findOne({ username });
  if (usernameUser) {
    return resp.status(404).send({ error: "Username already taken." });
  }

  let id = 1;
  if (lastUser) {
    id = lastUser.id + 1;
  }
  const newUser = {
    email,
    username,
    fullname,
    title,
    skills,
    address,
    job_type,
    id,
    password,
    is_active: true,
    followers: [],
    followings: [],
  };
  User.create(newUser)
    .then((createdUser) => {
      console.log("User Created");
      resp.status(200).send(createdUser);
    })
    .catch((err) => {
      console.error(err);
      resp.status(500).send({ error: "Cannot process your request." });
    });
});

app.listen(PORT, () => {
  console.log("Hello World!");
  console.log("App is running on port " + PORT);
});
