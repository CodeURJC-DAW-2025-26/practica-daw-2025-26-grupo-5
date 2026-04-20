cd ./frontend && npm run build
cd ..

mkdir -p ./backend/src/main/resources/static
rm -rf ./backend/src/main/resources/static/*
cd -r ./frontend/build/client/* ./backend/src/main/resources/static

mkdir -p ./backend/node/public/
rm -rf ./backend/node/public/*
cd -r ./frontend/build/client/* ./backend/node/public/