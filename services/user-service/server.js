import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user-routes.js';
import { purgeUnverifiedUsers, initCleanupCron } from './tasks/cleanup.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());


app.use('/api/users', userRoutes);

const PORT = 8080;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);
    initCleanupCron();});

