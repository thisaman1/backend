import dotenv from "dotenv";
import connectToDb from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path: "./.env"
})

// app.get('/', (req, res) => {
//     res.send(`
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Inline HTML</title>
//         </head>
//         <body>
//             <h1>Welcome to My Express App</h1>
//             <p>This is an inline HTML example served using Express!</p>
//         </body>
//         </html>
//     `);
// });

connectToDb()
.then(()=>{
    app.on("error", (error) => {
        console.log(`Error Occured !!`, error); 
    })
    const port = process.env.PORT || 8000;
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    })
    
})
.catch((error) => {
    console.log(`Database Connection Failed !!`, error);
});
