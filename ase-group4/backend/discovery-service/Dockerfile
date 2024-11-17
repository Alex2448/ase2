FROM openjdk:17
EXPOSE 8761
ADD /target/discovery-service-0.0.1-SNAPSHOT.jar springboot-discovery-service.jar
ENTRYPOINT ["java","-jar","springboot-discovery-service.jar"]