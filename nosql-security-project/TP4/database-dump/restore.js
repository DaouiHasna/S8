// MongoDB Restore Script for mongosh
// Usage: mongosh < restore.js

use soc_lite;

// Drop existing collections (optional - remove if you want to keep existing data)
db.users.drop();
db.security_logs.drop();

// Insert users
db.users.insertMany([
    { username: "alice", password: "motdepasse123", role: "analyst" },
    { username: "bob",   password: "secret456",     role: "admin" },
    { username: "carol", password: "carol789",       role: "viewer" }
]);

// Insert security logs
db.security_logs.insertMany([
    { src_ip: "192.168.1.10", action: "login", status: "open", ts: new Date() },
    { src_ip: "192.168.1.11", action: "logout", status: "closed", ts: new Date() },
    { src_ip: "10.0.0.5", action: "alert", status: "investigating", ts: new Date() }
]);

// Add sensitive data for projection test
db.security_logs.updateOne(
    { src_ip: "192.168.1.10" },
    { $set: { password_hash: "HASH_FICTIF_SENSIBLE", internal_note: "ticket_17_confidentiel" } }
);

// Verify
print("=== Database Restored ===");
print("Users count: " + db.users.countDocuments());
print("Logs count: " + db.security_logs.countDocuments());
print("Collections: " + db.getCollectionNames().join(", "));
