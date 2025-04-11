// server.js
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://12345678aaa:12345678aaa@cluster0.wyz9n4z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  await client.connect();
  db = client.db("birthdayWeb"); // 可自定义数据库名
  console.log("数据库连接成功");
}
connectDB();

// === 1. 留言板相关接口 ===
app.post("/api/messages", async (req, res) => {
  const { author, nickname, content } = req.body;
  const message = { author, nickname, content, createdAt: new Date() };
  await db.collection("messages").insertOne(message);
  res.status(201).send("留言已保存");
});

app.get("/api/messages", async (req, res) => {
  const messages = await db.collection("messages").find().sort({ createdAt: 1 }).toArray();
  res.json(messages);
});

// === 2. 目标板块相关接口 ===
const { ObjectId } = require("mongodb"); // ✅ 引入 ObjectId

// 获取全部目标
app.get("/api/goals", async (req, res) => {
  const goals = await db.collection("goals").find().sort({ createdAt: 1 }).toArray();
  res.json(goals);
});

// 添加目标
app.post("/api/goals", async (req, res) => {
  const { type, content } = req.body;
  const goal = {
    type,
    content,
    completed: false,       // ✅ 关键：设置初始状态
    createdAt: new Date(),
  };
  await db.collection("goals").insertOne(goal);
  res.status(201).send("目标已保存");
});

// 更新目标状态（勾选 / 取消勾选）
app.patch("/api/goals/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  await db.collection("goals").updateOne(
    { _id: new ObjectId(id) },
    { $set: { completed } }
  );
  res.send("目标状态已更新");
});

// 删除所有“已完成”的目标（用于自动清空）
app.delete("/api/goals/completed/:type", async (req, res) => {
  const { type } = req.params;
  await db.collection("goals").deleteMany({ type, completed: true });
  res.send("已删除所有已完成目标");
});

// === 3. 日历事项相关接口 ===
app.post("/api/calendar", async (req, res) => {
  const { year, month, day, icon, note } = req.body;
  await db.collection("calendar").updateOne(
    { year, month, day },
    { $set: { icon, note } },
    { upsert: true }
  );
  res.send("日历事项已保存");
});

app.get("/api/calendar", async (req, res) => {
  const data = await db.collection("calendar").find().toArray();
  res.json(data);
});

app.delete("/api/calendar", async (req, res) => {
    const { year, month, day } = req.body;
    await db.collection("calendar").deleteOne({ year, month, day });
    res.send("事项已删除");
  });

const PORT = 3000;
app.listen(PORT, () => console.log(`后端服务已启动：http://localhost:${PORT}`));

