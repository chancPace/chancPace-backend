import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/test', (req, res) => {
    res.send('서버연결 테스트');
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
