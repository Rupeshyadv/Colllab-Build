import { httpServer } from './src/app.js';
import dotenv from 'dotenv';
// import path from 'path';

dotenv.config({ path: ".env"})


const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    try{
        console.log(`Server is running on http://localhost:${port}`);
    } catch(error){
        console.error('Error starting the server:', error);
    }
})