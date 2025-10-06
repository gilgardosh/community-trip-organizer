import app from './app.js';
import config from './config/index.js';

const port = config.port || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
