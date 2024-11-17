#FROM openjdk:8-jdk-alpinev
FROM openjdk:17
ADD target/delivery-service-0.0.1-SNAPSHOT.jar springboot-delivery-service.jar
ENTRYPOINT ["java","-jar","springboot-delivery-service.jar", "app.jar"]