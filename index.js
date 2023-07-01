const express = require("express");
const config = require("./config/cnf");
const login = require("./middleware/oauth");
const app = express();
const session = require('express-session');
const upload = require("./config/uploads");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const fs = require("fs");


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, "public/")))



app.get("/", (req, res) => {
  res.render('index')
});



app.get("/admin", login, (req, res) => {
    const publicPath = __dirname + '/bin';
    fs.readdir(publicPath, (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).send('ERR');
      }
  
      const fileDetails = files.map(file => {
        const filePath = publicPath + '/' + file;
        const stats = fs.statSync(filePath);
  
        return {
          delete: file,
          name: file,
          size: formatFileSize(stats.size),
          created: formatDate(stats.birthtime)
        };
      });
  
      res.render('admin', { files: fileDetails });
    });
  });

app.post("/login", (req,res) => {
    const name = req.body.name
    const password = req.body.password
     if (name === config.username && password === config.username) {
        req.session.user = name;
        res.redirect("/admin");
      } else {
        console.log('--------------------------------')
        console.log(config.username)
        console.log(config.password)
        console.log('--------------------------------')
        console.log(name)
        console.log(password)
        console.log('--------------------------------')
        res.redirect("/");
      }
});



app.post('/storage/uploads/file', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).send('Başarısız oldu');
    return;
  }
  res.send('Yüklendi');
});
  
  app.get('/storage/uploads', (req, res) => {
    res.send(uploadedFiles);
  });


  app.post('/storage/delete/:id', (req, res) => {
    const id = req.params.id;
    const filePath = `bin/${id}`;
  
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.status(404).send('Bulunmadı');
        } else {
          res.status(500).send('Hata');
        }
        return;
      }
  
      if (stats.isDirectory()) {
        fs.rmdir(filePath, { recursive: true }, (err) => {
          if (err) {
            res.status(500).send('Hata');
          } else {
            res.send('Silindi.');
          }
        });
      } else {
        fs.unlink(filePath, (err) => {
          if (err) {
            res.status(500).send('Hata');
          } else {
            res.send('Silindi');
          }
        });
      }
    });
  });
  
        
  
      app.post('/storage/dowland/:id', (req, res) => {
          const id = req.params.id;
          const filePath = `bin/${id}`;
        
          fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
              res.status(404).send(err);
              return;
            }
            res.download(filePath, (err) => {
              if (err) {
  
                res.status(500).send(err);
              }
            });
          });
      });
  
  
  
  
  
  
  
  
  
  
  



function formatFileSize(size) {
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }
  
  function formatDate(date) {
    return date.toLocaleString();
  }

console.log(upload)
app.listen(config.port, () =>{
    console.log(`🛬 ${config.port}`);
})

