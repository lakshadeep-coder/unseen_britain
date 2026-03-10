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
    name: "unseen_sid",
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);
function requireLogin(req, res, next) {
  if (!req.session.uid) {
    return res.redirect("/login");
  }
  next();
}

function createLoginSession(req, userId, res) {
  req.session.regenerate((regenerateErr) => {
    if (regenerateErr) {
      console.error("Session regenerate failed:", regenerateErr);
      return res.render("login", {
        error: "Could not start session. Please try again."
      });
    }

    req.session.uid = userId;
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save failed:", saveErr);
        return res.render("login", {
          error: "Could not save session. Please try again."
        });
      }
      return res.redirect("/dashboard");
    });
  });
}

function normalizeCost(rawCost = {}) {
  const travel_cost = Number(rawCost.travel_cost) || 0;
  const food_cost = Number(rawCost.food_cost) || 0;
  const stay_cost = Number(rawCost.stay_cost) || 0;
  const entry_fee = Number(rawCost.entry_fee) || 0;
  return {
    ...rawCost,
    travel_cost,
    food_cost,
    stay_cost,
    entry_fee
  };
}

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "static", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpeg|jpg|png)$/i;
    const allowedMime = /^image\/(jpeg|jpg|png)$/i;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedMime.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only JPG / PNG images allowed"));
  }
});
const uploadMultiple = upload.array("photos", 5);

const createPhotosUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (!err) return next();
    return res.status(400).render("create_place", {
      errors: [err.message || "Image upload failed"],
      form: req.body
    });
  });
};

const multiPhotoUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (!err) return next();
    return res.status(400).render("edit_place_details", {
      errors: [err.message || "Image upload failed"],
      place: req.body,
      cost: req.body,
      reqs: req.body
    });
  });
};


// // Create a route for root - /
// app.get("/", function (req, res) {
//   res.render("home", {
//     title: "Unseen Britain",
//   });
// });

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

        return createLoginSession(req, user.id, res);

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
        return createLoginSession(req, user.id, res);

    } catch (err) {
        console.error(err);
        res.render("registration", {
            error: "Registration failed. Try again."
        });
    }
});


app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("unseen_sid");
    res.redirect("/login");
  });
});

// GET CREATE PLACE PAGE
app.get("/place/create", requireLogin, (req, res) => {
  res.render("create_place");
});

// CREATE PLACE
app.post(
  "/place/create",
  requireLogin,
  createPhotosUpload,
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

    // INSERT PHOTOS
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(`
          INSERT INTO place_photos (place_id, image_path)
          VALUES (?, ?)
        `, [
          placeId,
          `/uploads/${file.filename}`
        ]);
      }
    }

    // SUCCESS MESSAGE
    res.render("create_place", {
      success: "Place created successfully 🎉"
    });
  }
);


// EDIT PLACE
app.get("/place/edit/:id", requireLogin, (req, res) => {
  res.redirect(`/place/details/edit/${req.params.id}`);
});

// GET edit place
app.get("/place/details/edit/:id", requireLogin, async (req, res) => {
  const placeId = req.params.id;
  const place = await db.query(
    "SELECT * FROM places WHERE id=? AND user_id=?",
    [placeId, req.session.uid]
  );

  if (place.length === 0) {
    return res.redirect("/dashboard");
  }

  const cost = await db.query(
    "SELECT * FROM place_costs WHERE place_id=?",
    [placeId]
  );

  const reqs = await db.query(
    "SELECT * FROM place_requirements WHERE place_id=?",
    [placeId]
  );

  res.render("edit_place_details", {
    place: place[0],
    cost: cost[0],
    reqs: reqs[0]
  });
});

// POST edit place
app.post(
  "/place/details/edit/:id",
  requireLogin,
  multiPhotoUpload,
  async (req, res) => {

    const placeId = req.params.id;
    const errors = [];
    const { title, description, region, category, difficulty } = req.body;

    if (!title) errors.push("Title is required");
    if (!description) errors.push("Description is required");
    if (!region) errors.push("Region is required");
    if (!category) errors.push("Category is required");
    if (!difficulty) errors.push("Difficulty is required");

    if (errors.length > 0) {
      return res.status(400).render("edit_place_details", {
        errors,
        place: req.body,
        cost: req.body,
        reqs: req.body
      });
    }

    const updatedPlace = await db.query(`
      UPDATE places
      SET title=?, description=?, region=?, category=?, difficulty=?
      WHERE id=? AND user_id=?
    `, [
      title,
      description,
      region,
      category,
      difficulty,
      placeId,
      req.session.uid
    ]);

    if (updatedPlace.affectedRows === 0) {
      return res.redirect("/dashboard");
    }

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
      place: req.body,
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

  const normalizedCost = normalizeCost(cost[0]);
  const totalCost =
    normalizedCost.travel_cost +
    normalizedCost.food_cost +
    normalizedCost.stay_cost +
    normalizedCost.entry_fee;

  res.render("place_detail", {
    place: place[0],
    cost: normalizedCost,
    totalCost,
    reqs: reqs[0] || {},
    photos
  });
});

// VISITOR HOME – SHOW ALL PLACES
// VISITOR HOME – SEARCH + FILTER
app.get("/", async (req, res) => {
  const { q, category, difficulty, region } = req.query;

  let conditions = [];
  let values = [];

  if (q) {
    conditions.push("(p.title LIKE ? OR p.description LIKE ?)");
    values.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    conditions.push("p.category = ?");
    values.push(category);
  }

  if (difficulty) {
    conditions.push("p.difficulty = ?");
    values.push(difficulty);
  }

  if (region) {
    conditions.push("p.region LIKE ?");
    values.push(`%${region}%`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const places = await db.query(`
    SELECT p.id, p.title, p.region, p.category, p.difficulty,
           MIN(ph.image_path) AS image
    FROM places p
    LEFT JOIN place_photos ph ON p.id = ph.place_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, values);

  res.render("home", {
    places,
    filters: req.query
  });
});



// VISITOR PLACE DETAIL
app.get("/place/view/:id", async (req, res) => {
  const placeId = req.params.id;
  const userId = req.session.uid || null;

  const place = await db.query(
    "SELECT * FROM places WHERE id = ?",
    [placeId]
  );

  if (place.length === 0) {
    return res.redirect("/");
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

  const ratingSummary = await db.query(
    `
    SELECT ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS total_ratings
    FROM ratings
    WHERE place_id = ?
    `,
    [placeId]
  );

  let userRating = null;
  let userReview = null;
  let isFavorite = false;
  if (userId) {
    const userRatingRow = await db.query(
      `
      SELECT rating
      FROM ratings
      WHERE place_id = ? AND user_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [placeId, userId]
    );
    userRating = userRatingRow.length > 0 ? Number(userRatingRow[0].rating) : null;

    const favoriteRow = await db.query(
      "SELECT id FROM favorites WHERE place_id = ? AND user_id = ? LIMIT 1",
      [placeId, userId]
    );
    isFavorite = favoriteRow.length > 0;

    const userReviewRow = await db.query(
      `
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE place_id = ? AND user_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [placeId, userId]
    );
    userReview = userReviewRow.length > 0 ? userReviewRow[0] : null;
  }

  const reviews = await db.query(
    `
    SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.full_name
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    WHERE rv.place_id = ? AND rv.comment IS NOT NULL AND TRIM(rv.comment) <> ''
    ORDER BY rv.created_at DESC
    LIMIT 20
    `,
    [placeId]
  );

  const normalizedCost = normalizeCost(cost[0]);
  const totalCost =
    normalizedCost.travel_cost +
    normalizedCost.food_cost +
    normalizedCost.stay_cost +
    normalizedCost.entry_fee;

  res.render("place_detail_visitor", {
    place: place[0],
    cost: normalizedCost,
    totalCost,
    currentUserId: userId,
    ratingSummary: ratingSummary[0] || { avg_rating: null, total_ratings: 0 },
    userRating,
    userReview,
    reviews,
    isFavorite,
    reqs: reqs[0] || {},
    photos
  });
});

app.post("/rate/:id", requireLogin, async (req, res) => {

  const placeId = req.params.id;
  const parsedRating = Number(req.body.rating);
  if (!Number.isFinite(parsedRating)) {
    return res.redirect("back");
  }
  const rating = Math.min(Math.max(Math.round(parsedRating), 1), 5);

  const existing = await db.query(
    "SELECT id FROM ratings WHERE user_id=? AND place_id=? LIMIT 1",
    [req.session.uid, placeId]
  );

  if (existing.length > 0) {
    await db.query(
      "UPDATE ratings SET rating=? WHERE id=?",
      [rating, existing[0].id]
    );
  } else {
    await db.query(
      "INSERT INTO ratings (user_id, place_id, rating) VALUES (?, ?, ?)",
      [req.session.uid, placeId, rating]
    );
  }

  res.redirect("back");

});

app.post("/review/:id", requireLogin, async (req, res) => {
  const placeId = req.params.id;
  const comment = (req.body.comment || "").trim();
  const parsedRating = Number(req.body.review_rating);
  const hasRating = Number.isFinite(parsedRating);
  const rating = hasRating
    ? Math.min(Math.max(Math.round(parsedRating), 1), 5)
    : null;

  if (!comment) {
    return res.redirect("back");
  }

  const existingReview = await db.query(
    "SELECT id FROM reviews WHERE user_id=? AND place_id=? LIMIT 1",
    [req.session.uid, placeId]
  );

  if (existingReview.length > 0) {
    await db.query(
      "UPDATE reviews SET comment=?, rating=? WHERE id=?",
      [comment, rating, existingReview[0].id]
    );
  } else {
    await db.query(
      "INSERT INTO reviews (user_id, place_id, rating, comment) VALUES (?, ?, ?, ?)",
      [req.session.uid, placeId, rating, comment]
    );
  }

  if (rating !== null) {
    const existingRating = await db.query(
      "SELECT id FROM ratings WHERE user_id=? AND place_id=? LIMIT 1",
      [req.session.uid, placeId]
    );

    if (existingRating.length > 0) {
      await db.query(
        "UPDATE ratings SET rating=? WHERE id=?",
        [rating, existingRating[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO ratings (user_id, place_id, rating) VALUES (?, ?, ?)",
        [req.session.uid, placeId, rating]
      );
    }
  }

  res.redirect("back");
});

app.post("/favorite/:id", requireLogin, async (req, res) => {

  const placeId = req.params.id;

  const existing = await db.query(
    "SELECT * FROM favorites WHERE user_id=? AND place_id=?",
    [req.session.uid, placeId]
  );

  if (existing.length > 0) {

    await db.query(
      "DELETE FROM favorites WHERE user_id=? AND place_id=?",
      [req.session.uid, placeId]
    );

  } else {

    await db.query(
      "INSERT INTO favorites (user_id, place_id) VALUES (?, ?)",
      [req.session.uid, placeId]
    );

  }

  res.redirect("back");

});

app.get("/explore", requireLogin, async (req, res) => {
  const { q, category, difficulty, region } = req.query;

  let conditions = [];
  let values = [];

  if (q) {
    conditions.push("(p.title LIKE ? OR p.description LIKE ?)");
    values.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    conditions.push("p.category = ?");
    values.push(category);
  }

  if (difficulty) {
    conditions.push("p.difficulty = ?");
    values.push(difficulty);
  }

  if (region) {
    conditions.push("p.region LIKE ?");
    values.push(`%${region}%`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const topPlaces = await db.query(`
    SELECT p.id, p.title, p.region, p.category, p.difficulty,
           MIN(ph.image_path) AS image,
           ROUND(AVG(r.rating), 1) AS avg_rating
    FROM places p
    LEFT JOIN place_photos ph ON p.id = ph.place_id
    LEFT JOIN ratings r ON p.id = r.place_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY avg_rating DESC, p.created_at DESC
    LIMIT 6
  `, values);

  const places = await db.query(`
    SELECT p.id, p.title, p.region, p.category, p.difficulty,
           MIN(ph.image_path) AS image,
           ROUND(AVG(r.rating), 1) AS avg_rating
    FROM places p
    LEFT JOIN place_photos ph ON p.id = ph.place_id
    LEFT JOIN ratings r ON p.id = r.place_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, values);

  res.render("explore_places", {
    topPlaces,
    places,
    filters: req.query
  });

});

app.get("/favorites", requireLogin, async (req, res) => {
  const places = await db.query(`
    SELECT p.id, p.title, p.region, p.category, p.difficulty,
           MIN(ph.image_path) AS image,
           ROUND(AVG(r.rating), 1) AS avg_rating,
           MAX(f.id) AS favorited_at
    FROM favorites f
    JOIN places p ON p.id = f.place_id
    LEFT JOIN place_photos ph ON p.id = ph.place_id
    LEFT JOIN ratings r ON p.id = r.place_id
    WHERE f.user_id = ?
    GROUP BY p.id
    ORDER BY favorited_at DESC
  `, [req.session.uid]);

  res.render("favorites", { places });
});

app.get("/profile", requireLogin, async (req, res) => {
  const user = await db.query(
    "SELECT id, full_name, email, phone, created_at FROM users WHERE id=? LIMIT 1",
    [req.session.uid]
  );

  if (user.length === 0) {
    return res.redirect("/logout");
  }

  const stats = await db.query(
    `
    SELECT
      (SELECT COUNT(*) FROM places WHERE user_id = ?) AS places_count,
      (SELECT COUNT(*) FROM favorites WHERE user_id = ?) AS favorites_count,
      (SELECT COUNT(*) FROM ratings WHERE user_id = ?) AS ratings_count,
      (SELECT COUNT(*) FROM reviews WHERE user_id = ?) AS reviews_count
    `,
    [req.session.uid, req.session.uid, req.session.uid, req.session.uid]
  );

  res.render("profile", {
    user: user[0],
    stats: stats[0] || {}
  });
});


// Start server on port 3000
app.listen(3000, function () {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
