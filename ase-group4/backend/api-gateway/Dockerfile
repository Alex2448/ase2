#FROM openjdk:8-jdk-alpine
FROM openjdk:17
ADD target/api-gateway-0.0.1-SNAPSHOT.jar springboot-api-gateway.jar
ENTRYPOINT ["java","-jar","springboot-api-gateway.jar", "app.jar"]