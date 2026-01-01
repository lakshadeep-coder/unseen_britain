// Import express.js
const express = require("express");
const { User } = require("./models/user");


const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require("./services/db");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// pug engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Session config

app.use(
  session({
    secret: "unseen-britain-secret",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
  })
);
function requireLogin(req, res, next) {
  if (!req.session.uid) {
    return res.redirect("/login");
  }
  next();
}

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./static/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb("Only JPG / PNG images allowed");
  }
});
const uploadMultiple = upload.array("photos", 5);


// Create a route for root - /
app.get("/", function (req, res) {
  res.render("home", {
    title: "Unseen Britain",
  });
});

// Create a route for testing the db
app.get("/db_test", function (req, res) {
  // Assumes a table called test_table exists in your database
  sql = "select * from test_table";
  db.query(sql).then((results) => {
    console.log(results);
    res.send(results);
  });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function (req, res) {
  res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function (req, res) {
  // req.params contains any parameters in the request
  // We can examine it in the console for debugging purposes
  console.log(req.params);
  //  Retrieve the 'name' parameter and use it in a dynamically generated page
  res.send("Hello " + req.params.name);
});

app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

app.post("/authenticate", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", {
            error: "Email and password are required"
        });
    }

    try {
        const user = new User({ email });
        const isValid = await user.authenticate(password);

        if (!isValid) {
            return res.render("login", {
                error: "Invalid email or password"
            });
        }

        req.session.uid = user.id;
        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        res.render("login", {
            error: "Something went wrong. Please try again."
        });
    }
});


app.get("/registration", (req, res) => {
    res.render("registration", { error: null });
});

app.post("/registration", async (req, res) => {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
        return res.render("registration", {
            error: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.render("registration", {
            error: "Password must be at least 6 characters"
        });
    }

    if (password !== confirmPassword) {
        return res.render("registration", {
            error: "Passwords do not match"
        });
    }

    try {
        const user = new User({ fullName, email, phone });
        const existing = await user.getIdFromEmail();

        if (existing) {
            return res.render("registration", {
                error: "Email is already registered"
            });
        }

        await user.register(password);
        req.session.uid = user.id;
        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        res.render("registration", {
            error: "Registration failed. Try again."
        });
    }
});


app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// GET CREATE PLACE PAGE
app.get("/place/create", requireLogin, (req, res) => {
  res.render("create_place");
});

// CREATE PLACE
app.post(
  "/place/create",
  requireLogin,
  upload.single("photo"),
  async (req, res) => {

    const errors = [];
    const {
      title, description, region, category, difficulty,
      travel_cost, food_cost, stay_cost, entry_fee
    } = req.body;

    // VALIDATION
    if (!title) errors.push("Title is required");
    if (!description) errors.push("Description is required");
    if (!region) errors.push("Region is required");
    if (!category) errors.push("Category is required");
    if (!difficulty) errors.push("Difficulty is required");

    if (errors.length > 0) {
      return res.render("create_place", {
        errors,
        form: req.body
      });
    }

    // INSERT PLACE
    const result = await db.query(`
      INSERT INTO places (user_id, title, description, region, category, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.session.uid,
      title,
      description,
      region,
      category,
      difficulty
    ]);

    const placeId = result.insertId;

    // INSERT COSTS
    await db.query(`
      INSERT INTO place_costs (place_id, travel_cost, food_cost, stay_cost, entry_fee)
      VALUES (?, ?, ?, ?, ?)
    `, [
      placeId,
      travel_cost || 0,
      food_cost || 0,
      stay_cost || 0,
      entry_fee || 0
    ]);

    // INSERT REQUIREMENTS
    await db.query(`
      INSERT INTO place_requirements (place_id, footwear, water, food, raincoat)
      VALUES (?, ?, ?, ?, ?)
    `, [
      placeId,
      req.body.footwear ? 1 : 0,
      req.body.water ? 1 : 0,
      req.body.food ? 1 : 0,
      req.body.raincoat ? 1 : 0
    ]);

    // INSERT PHOTO
    if (req.file) {
      await db.query(`
        INSERT INTO place_photos (place_id, image_path)
        VALUES (?, ?)
      `, [
        placeId,
        `/uploads/${req.file.filename}`
      ]);
    }

    // SUCCESS MESSAGE
    res.render("create_place", {
      success: "Place created successfully 🎉"
    });
  }
);


// EDIT PLACE
// GET edit costs & requirements
app.get("/place/details/edit/:id", requireLogin, async (req, res) => {
  const placeId = req.params.id;

  const cost = await db.query(
    "SELECT * FROM place_costs WHERE place_id=?",
    [placeId]
  );

  const reqs = await db.query(
    "SELECT * FROM place_requirements WHERE place_id=?",
    [placeId]
  );

  res.render("edit_place_details", {
    cost: cost[0],
    reqs: reqs[0]
  });
});

// POST edit costs & requirements
app.post(
  "/place/details/edit/:id",
  requireLogin,
  uploadMultiple,
  async (req, res) => {

    const placeId = req.params.id;

    await db.query(`
      UPDATE place_costs
      SET travel_cost=?, food_cost=?, stay_cost=?, entry_fee=?
      WHERE place_id=?
    `, [
      req.body.travel_cost || 0,
      req.body.food_cost || 0,
      req.body.stay_cost || 0,
      req.body.entry_fee || 0,
      placeId
    ]);

    await db.query(`
      UPDATE place_requirements
      SET footwear=?, water=?, food=?, raincoat=?
      WHERE place_id=?
    `, [
      req.body.footwear ? 1 : 0,
      req.body.water ? 1 : 0,
      req.body.food ? 1 : 0,
      req.body.raincoat ? 1 : 0,
      placeId
    ]);

    // Save multiple photos
    if (req.files) {
      for (const file of req.files) {
        await db.query(`
          INSERT INTO place_photos (place_id, image_path)
          VALUES (?, ?)
        `, [placeId, `/uploads/${file.filename}`]);
      }
    }

    res.render("edit_place_details", {
      success: "Details updated successfully ✅",
      cost: req.body,
      reqs: req.body
    });
  }
);


// DELETE PLACE
app.post("/place/delete/:id", requireLogin, async (req, res) => {
  await db.query(
    "DELETE FROM places WHERE id=? AND user_id=?",
    [req.params.id, req.session.uid]
  );
  res.redirect("/dashboard");
});

// DASHBOARD WITH FILTERS
app.get("/dashboard", requireLogin, async (req, res) => {
  const { category, difficulty, region } = req.query;

  let conditions = ["p.user_id=?"];
  let values = [req.session.uid];

  if (category) { conditions.push("p.category=?"); values.push(category); }
  if (difficulty) { conditions.push("p.difficulty=?"); values.push(difficulty); }
  if (region) { conditions.push("p.region LIKE ?"); values.push(`%${region}%`); }

  const places = await db.query(`
    SELECT p.*,
      COUNT(DISTINCT ph.id) AS photo_count,
      COUNT(DISTINCT pr.id) AS risk_count
    FROM places p
    LEFT JOIN place_photos ph ON p.id = ph.place_id
    LEFT JOIN place_risks pr ON p.id = pr.place_id
    WHERE ${conditions.join(" AND ")}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, values);

  res.render("dashboard", { places, filters: req.query });
});

app.get("/place/:id", requireLogin, async (req, res) => {
  const placeId = req.params.id;

  const place = await db.query(
    `
    SELECT *
    FROM places
    WHERE id = ? AND user_id = ?
    `,
    [placeId, req.session.uid]
  );

  if (place.length === 0) {
    return res.redirect("/dashboard");
  }

  const cost = await db.query(
    "SELECT * FROM place_costs WHERE place_id = ?",
    [placeId]
  );

  const reqs = await db.query(
    "SELECT * FROM place_requirements WHERE place_id = ?",
    [placeId]
  );

  const photos = await db.query(
    "SELECT * FROM place_photos WHERE place_id = ?",
    [placeId]
  );

  res.render("place_detail", {
    place: place[0],
    cost: cost[0] || {},
    reqs: reqs[0] || {},
    photos
  });
});



// Start server on port 3000
app.listen(3000, function () {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
