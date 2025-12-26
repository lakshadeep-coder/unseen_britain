// Import express.js
const express = require("express");
const { User } = require("./models/user");
const db = require("./services/db");

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

// Start server on port 3000
app.listen(3000, function () {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
