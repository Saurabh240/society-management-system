# ---------- build stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# copy only pom first to leverage Docker cache for dependencies
COPY pom.xml .
RUN mvn -B -e dependency:go-offline

# copy source and build fat jar
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- runtime stage ----------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# copy jar produced in build stage (pick the single jar in target)
COPY --from=build /app/target/*.jar app.jar

# expose the port your Spring Boot app runs on
EXPOSE 8080

# default env vars (can be overridden)
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/societydb \
    SPRING_DATASOURCE_USERNAME=societydb \
    SPRING_DATASOURCE_PASSWORD=Societydb@123 \
    JWT_SECRET=Pa8QFmbk/9BR33m+K6ischX4VEoyJ0DM3JlB3hf0uuw=

ENTRYPOINT ["java","-jar","/app/app.jar"]
