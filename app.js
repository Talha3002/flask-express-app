const express = require("express");
const multer = require("multer");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { summary: null }); // Ensure summary is defined, even if empty
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
    const filePath = req.file.path;
    const summaryLength = req.body.summaryLength;

    try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));
        formData.append("length", summaryLength);

        const response = await axios.post(
            "http://127.0.0.1:5000/summarize", // Correct the URL to '/summarize'
            formData,
            { headers: formData.getHeaders() }
        );

        // Pass the summary to the EJS template
        res.render("index", { summary: response.data.summary });
    } catch (error) {
        res.render("index", { summary: "Error: " + error.message });
    } finally {
        fs.unlinkSync(filePath); // Clean up the uploaded file
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
