const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

// Serve the uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep the original file name
    }
});

const upload = multer({ storage: storage });

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/list', function (req, res) {
    const uploadDirectory = 'uploads/';

    fs.readdir(uploadDirectory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            res.status(500).send('Error listing files');
        } else {
            let fileList = '';
            files.forEach((file) => {
                fileList += `
                    <div>
                        <button class="delete-button" onclick="deleteFile('${file}')">Delete File</button>
                        <a href="/download?file=${file}">${file}</a>
                    </div>
                `;
            });

            // Read the contents of the list.html file
            fs.readFile(path.join(__dirname, 'list.html'), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading list.html:', err);
                    res.status(500).send('Error reading HTML file');
                } else {
                    // Replace the <!-- fileList --> in list.html with the actual file list
                    const updatedListPage = data.replace('<!-- fileList -->', fileList);
                    res.send(updatedListPage);
                }
            });
        }
    });
});

app.get('/delete', function (req, res) {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'uploads', fileName);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            res.status(500).send('Error deleting the file');
        } else {
            console.log('File deleted:', fileName);
            res.sendStatus(200); // Send a success response
        }
    });
});

app.post('/upload', upload.single('file'), function (req, res) {
    res.sendFile(path.join(__dirname, 'home.html')); // Serve the home page again
});

app.get('/download', function(req, res) {
    const file = `${__dirname}/uploads/${req.query.file}`;
    res.download(file);
});

app.listen(3000, function () {
    console.log('File server listening on port 3000!');
});
