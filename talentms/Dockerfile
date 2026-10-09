# Multi-stage build: Gradle 8 + JDK 21 -> Temurin 21 JRE (alpine)
FROM gradle:8.10-jdk21 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
# Cache dependencies first (fails gracefully if no source yet)
COPY src ./src
RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && apk add --no-cache curl
USER appuser
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/build/libs/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS:- -XX:MaxRAMPercentage=75.0} -jar app.jar --server.port=${PORT:-8080}"]
