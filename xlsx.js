const express = require("express");
const app = express();
const PORT = 3000;
const path = require('path')
const xlsx = require('xlsx')
app.get('/read',(req,res)=>{
    const filePath = path.join(__dirname,"excel","output.xlsx")

    const workbook = xlsx.readFile(filePath)
    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const jsonData = xlsx.utils.sheet_to_json(sheet)

    res.json(jsonData)
})


app.get('/write',(req,res)=>{
    const data = [
        { Name: "gomathi", Age: 25 },
        { Name: "Ajay", Age: 24 }
    ]

    
    const worksheet = xlsx.utils.json_to_sheet(data)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook,worksheet,"People")

    const filePath = path.join(__dirname,"excel","output.xlsx")
    xlsx.writeFile(workbook,filePath)

    res.send("file create succesfully")
})


app.get("/append-excel", (req, res) => {
    const filePath = path.join(__dirname, "excel", "output.xlsx");

    const newData = [
        { Name: "Rahul", Age: 30 },
        { Name: "Priya", Age: 22 }
    ];

    const workbook = xlsx.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    const existingData = xlsx.utils.sheet_to_json(sheet)

    const updatedData = [...existingData,...newData]

    const updatedsheet = xlsx.utils.json_to_sheet(updatedData)

    workbook.Sheets[sheetName] = updatedsheet

    xlsx.writeFile(workbook,filePath)

    res.send("New data appended to Excel successfully!");
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});