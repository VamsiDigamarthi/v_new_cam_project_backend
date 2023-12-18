import express from "express";
import cors from "cors";
import mysql from "mysql";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "camsdb",
});

const PORT = "8081";

connection.connect(function (err) {
  if (err) {
    console.log(err);
  }
  app.listen(PORT, () => {
    console.log(`app listen port number ${PORT}...!`);
  });
});

app.get("/", (req, res) => {
  res.json({ msg: "uajbshdhn" });
});

app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const fistSql = "SELECT * FROM `users` WHERE username like ? ";
    const validatedEmail = connection.query(fistSql, ["%" + username + "%"]);

    console.log(validatedEmail.length);
    res.json({ num: validatedEmail.length });

    if (validatedEmail.length > 0) {
      return res.status(401).json({
        msg: "Username already exists",
      });
    }

    var sql = "INSERT INTO users(username, password, role) VALUES(?,?,?)";

    connection.query(sql, [username, password, role], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("admin added successfully....!");
        console.log(result);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM `users` WHERE username like ? ";
  try {
    connection.query(sql, ["%" + username + "%"], (err, result) => {
      if (err) {
        throw err;
      } else {
        if (result[0].username === username) {
          if (result[0].password === password) {
            res.json(result);
          } else {
            res.json("password is not correct");
          }
        } else {
          res.json("user does't exist ....! ");
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
});

//
//
// bulk upload

app.post("/bulk-upload", (req, res) => {
  var values = [];

  for (let i of req.body) {
    values.push([
      i.State,
      i.District_Name,
      i.AC_No,
      i.AC_Name,
      i.PS_No,
      i.Location,
      i.PS_Name_and_Address,
      i.Camera,
      i.Box_No,
      i.Camera_ID,
      i.url,
    ]);
  }

  let sql =
    "INSERT INTO `camsdetails` (State, District_Name, AC_No, AC_Name, PS_No, Location, PS_Name_and_Address, Camera, Box_No,	Camera_ID, url ) VALUES ?";

  connection.query(sql, [values], (err, result) => {
    if (err) {
      res.status(500).json({
        meg: "something went wrong",
      });
    } else {
      console.log("succefully insert all");
      res.status(200).json({
        msg: "succefully insert all",
      });
    }
  });
});

//
//
// get all cams

app.get("/all-cams", async (req, res) => {
  try {
    // const allCams = await connection.query("SELECT * FROM `camsdetails` ");
    await connection.query(
      "SELECT * FROM camsdetails",
      function (err, result, fields) {
        if (err) throw err;
        // console.log(result);
        res.status(200).json(result);
      }
    );
  } catch (e) {
    return res.status(500).json({
      resp: false,
      msg: e,
    });
  }
});

//
//
// delete the cam

app.delete("/cam-delete/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM `camsdetails` WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({ message: "delete succesasfully....?" });
    }
  });
});

//
//
// update the cams details

app.put("/update-cam/:id", async (req, res) => {
  try {
    await connection.query("UPDATE camsdetails SET Status = ? WHERE id = ?", [
      "online",
      req.params.id,
    ]);

    res.status(200).json({
      resp: true,
      msg: "updates the cams",
    });
  } catch (e) {
    return res.status(500).json({
      msg: e,
    });
  }
});

// cam update all fileds

app.put("/updat-all-details/:id", async (req, res) => {
  // console.log(req.body.State);
  try {
    await connection.query(
      "UPDATE `camsdetails` SET State = ?, District_Name = ?, PS_No = ?, AC_No = ?, Camera_ID = ? WHERE id = ?;",
      [
        req.body.State,
        req.body.District_Name,
        req.body.PS_No,
        req.body.AC_No,
        req.body.Camera_ID,
        req.params.id,
      ]
    );
    res.status(200).json({
      resp: true,
      msg: "updates the cams details",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error,
    });
  }
});

//
// fetch filter data whene click apply btn start
//

app.get("/filter-data-from-btn-click", async (req, res) => {
  const sql =
    "SELECT * FROM `camsdetails` WHERE State LIKE ? AND District_Name LIKE ? AND AC_Name LIKE ? AND Status LIKE ?";

  try {
    await connection.query(
      sql,
      [
        "%" + req.query.State + "%",
        "%" + req.query.Dist + "%",
        "%" + req.query.Assembly + "%",
        "%" + req.query.Status + "%",
      ],
      function (err, result, fields) {
        if (err) throw err;
        // console.log(result);
        res.status(200).json(result);
      }
    );
  } catch (e) {
    return res.status(500).json({
      resp: false,
      msg: e,
    });
  }
});

//
// fetch filter data whene click apply btn end
//  [req.query.State, req.query.Dist, req.query.Assembly, req.query.Status],

//  "SELECT * FROM `camsdetails` WHERE State = ? AND District_Name = ? AND AC_Name = ? AND Status = ?";
