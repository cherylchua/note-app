import dotenv from 'dotenv';
import { setupApp } from './app';

dotenv.config();

(async () => {
    try {
        const app = await setupApp('3000');

        app.listen(app.get('port'), () => {
            console.log({
                ENV: app.get('env'),
                PORT: `Listening on port ${app.get('port')}`
            });
        });
    } catch (err) {
        console.log(err, 'error caught in server.ts');
    }
})();
