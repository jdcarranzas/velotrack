FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && apk add --no-cache curl
USER appuser
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS:- -XX:MaxRAMPercentage=75.0} -jar app.jar"]
