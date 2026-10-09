# Despliegue del prototipo en AWS

La plantilla crea una instancia EC2 con Docker, un volumen raíz EBS cifrado de 30 GB y un bucket S3 privado para transferir el código. La instancia ejecuta el microservicio y TimescaleDB. No tiene puertos de entrada abiertos: se accede a la API por un túnel autenticado de AWS Systems Manager (SSM).

Este despliegue es de una sola instancia. No implementa las réplicas multi-AZ, autoscaling ni la BD gestionada de la Entrega 3. Crea recursos con costo; el repositorio no los crea automáticamente.

## Requisitos

- Cuenta AWS con permisos para CloudFormation, EC2, S3, IAM y Systems Manager.
- AWS CLI v2 y el complemento Session Manager instalados en tu equipo.
- Una VPC con DNS habilitado y una subred pública de esa VPC, con ruta 0.0.0.0/0 a un Internet Gateway. La instancia necesita salida HTTPS a SSM, repositorios de paquetes, Maven y registros de contenedores.
- Ejecutar los comandos locales desde la carpeta del proyecto. Reemplazar los identificadores de ejemplo.

## 1. Crear la infraestructura

PowerShell:

```powershell
aws cloudformation deploy --region us-east-1 --stack-name velotrack-captura --template-file infra/aws.yaml --capabilities CAPABILITY_IAM --parameter-overrides VpcId=vpc-REEMPLAZAR SubnetId=subnet-REEMPLAZAR
aws cloudformation describe-stacks --region us-east-1 --stack-name velotrack-captura --query "Stacks[0].Outputs" --output table
```

Anotar las salidas InstanceId y ArtifactBucket. La finalización de CloudFormation confirma la creación de EC2; no certifica que Docker esté listo ni que la aplicación esté instalada.

## 2. Transferir el proyecto

El ZIP debe contener pom.xml, src, Dockerfile y compose.yaml en su raíz. La lista explícita excluye credenciales, cachés y binarios de pruebas.

```powershell
Compress-Archive -Path pom.xml,src,Dockerfile,compose.yaml,infra,docs,README.md,.env.example,.dockerignore -DestinationPath captura.zip -Force
aws s3 cp captura.zip s3://BUCKET_DE_SALIDA/captura.zip --region us-east-1
aws ssm start-session --target i-REEMPLAZAR --region us-east-1
```

## 3. Iniciar en EC2

Dentro de la sesión SSM:

```bash
sudo cloud-init status --wait
sudo docker compose version
sudo docker buildx version
sudo aws s3 cp s3://BUCKET_DE_SALIDA/captura.zip /tmp/captura.zip --region us-east-1
sudo unzip -o /tmp/captura.zip -d /opt/velotrack
cd /opt/velotrack
sudo bash infra/start-prototype.sh
sudo docker compose ps
curl --fail http://127.0.0.1:8080/actuator/health/readiness
```

El script genera contraseñas aleatorias en /opt/velotrack/.env, con permisos solo para su propietario. Consultar ese archivo dentro de la sesión SSM para obtener CAPTURE_PASSWORD. No subirlo al bucket ni al repositorio.

Para cambiar los atletas autorizados, editar ATHLETE_IDS en .env y ejecutar `sudo docker compose up -d`. Los UUID representan referencias a Talento; este prototipo no crea perfiles.

Si falla la instalación inicial, consultar `sudo tail -n 100 /var/log/cloud-init-output.log`. Si falla la aplicación, consultar `sudo docker compose logs --tail=100 app`.

## 4. Acceder desde el equipo local

En otra terminal local:

```powershell
aws ssm start-session --target i-REEMPLAZAR --region us-east-1 --document-name AWS-StartPortForwardingSession --parameters file://infra/ssm-port-forward.json
```

Mantener la terminal abierta y llamar a http://localhost:8080 con el usuario y contraseña del servidor. SSM cifra el transporte entre el equipo y EC2. El HTTP solo se usa en loopback; TimescaleDB permanece en la red privada de Docker.

No cambiar el enlace de la API a 0.0.0.0 para exponer HTTP Basic en Internet. Una publicación pública requiere HTTPS y la integración de Identidad definida en los entregables.

## Persistencia y respaldo

El volumen Docker `timescale-data` sobre EBS conserva la BD al recrear contenedores y reiniciar EC2. La migración Flyway se ejecuta al iniciar el microservicio.

Respaldo desde EC2:

```bash
cd /opt/velotrack
sudo mkdir -p /opt/velotrack/backups
sudo sh -c 'umask 077; docker compose exec -T db pg_dump -U velotrack -d velotrack -Fc > backups/velotrack.dump'
```

Copiar el respaldo fuera de la instancia antes de eliminarla. Para restaurar TimescaleDB hay que usar la misma versión, una BD vacía, y ejecutar `timescaledb_pre_restore()` y `timescaledb_post_restore()` según la [guía oficial de respaldo y restauración](https://docs.tigerdata.com/self-hosted/latest/backup-and-restore/logical-backup/). El proceso de restauración no fue automatizado en este prototipo.

`docker compose down` conserva los datos; `docker compose down -v` los borra. La eliminación del stack elimina EC2 y su volumen raíz, incluida la BD. No se configuraron respaldos automáticos ni recuperación multi-AZ.

## Costos y limpieza

Se facturan EC2, EBS, IPv4 pública, almacenamiento S3 y transferencias aplicables. Detener EC2 no elimina los costos de almacenamiento. Después de respaldar lo necesario, eliminar el objeto captura.zip del bucket antes de eliminar el stack; CloudFormation no elimina buckets con objetos.

```powershell
aws s3 rm s3://BUCKET_DE_SALIDA/captura.zip --region us-east-1
aws cloudformation delete-stack --stack-name velotrack-captura --region us-east-1
```

## Fuentes técnicas

- [AMI de Amazon Linux mediante parámetros SSM](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami-parameter-store.html).
- [Port forwarding con Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html).
- [Docker Compose, versión fijada para la instalación](https://github.com/docker/compose/releases/tag/v2.39.4).
