
#!/bin/bash
FECHA=$(date +"%Y-%m-%d_%H-%M");
cd "$(pwd)"
tar -cvjf "$FECHA"_api_development.tar.bz2 --exclude="./public/archivos/*.*" --exclude="./.ww*" --exclude="./.git*" --exclude="./node_modules" .
#tar -cvjf "$FECHA"_back.tar.bz2 --exclude="./node_modules" .

