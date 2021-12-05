# SimformsNodePractical

Installation Instructions\
Note: sql file is added if you want to skip the migration and db creation part

Step 1: Create .env file in root directory of project\
Added env.example file too for reference
Sample is given below\

JWT_PRIVATE_KEY="abc123"\
NODE_ENV="development"\
PORT=3000

DB_DEV_HOST="localhost"\
DB_DEV_USER="root"\
DB_DEV_PASS="mysql"\
DB_DEV_NAME="simforms_db"

DB_TEST_HOST=""\
DB_TEST_USER=""\
DB_TEST_PASS=""\
DB_TEST_NAME=""\
\
DB_PROD_HOST=""\
DB_PROD_USER=""\
DB_PROD_PASS=""\
DB_PROD_NAME=""

Step 2: Install Npm modules\
npm i

Step 3: Install Development NPM Modules\
npm install --only=dev

Step 4: Create Database\
npx sequelize db:create

Step 5: Execute Migrations\
npx sequelize db:migrate

Step 6: Execute The server\
npm start