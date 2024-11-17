#FROM openjdk:8-jdk-alpinev
FROM openjdk:17
ADD target/cas-service-0.0.1-SNAPSHOT.jar springboot-cas-service.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","springboot-cas-service.jar"]

