# DB Connection
PG_HOST="localhost"
PG_PORT="5432"
PG_DB_NAME="agendaescolar_node"
PG_USER="agendadmin"
PG_PASSWORD=".3dg4r4l4np03."
PG_DIALECT="postgres"
POOL_MAX=5
POOL_MIN=0
POOL_ACQUIRE=30000
POOL_IDLE=10000
PG_ROOT_USER=postgres
PG_ROOT_PASSWORD=Ventiuno*21
PG_CERT=./src/ssl/server.crt

# DB context
La base de datos busca que los registros se conserven, entonces cada registro tiene un campo estado 
y cada que se puede, también cuenta con fecha_registro
Los schemas son:
    - data: Los registros que hacen los usuarios: docuamentos, indicadores, 
    - engine: contiene los datos de usuarios, roles, menues, privilegios y cosas relacionadas
    - enterprise: la información de las cuentas de nuestgros clientes: de las empresas
    - public: generalmente no vamos a utilizar este schema