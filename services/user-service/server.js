import express from 'express';
import userRoutes from './routes/user-routes.js';
import { initCleanupCron } from './tasks/cleanup.js';

const app = express();

app.use(express.json());


app.use('/api/users', userRoutes);


const PORT = 8080;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);
    initCleanupCron();});

