const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve HTML from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cruddb';
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// User model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number
});

const User = mongoose.model("User", userSchema);

// READ all users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// CREATE new user
app.post("/users", async (req, res) => {
    try {
        const { name, email, age } = req.body;
        if (!name || !email || age === undefined || age === null) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const user = new User({ name, email, age });
        const saved = await user.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

// UPDATE user
app.put("/users/:id", async (req, res) => {
    try {
        const { name, email, age } = req.body;
        if (!name || !email || age === undefined || age === null) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, age },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));