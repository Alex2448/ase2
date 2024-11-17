FROM node:16
# set the working direction
#WORKDIR /frontend
ARG deployDir=/app
ENV API_URL=http://localhost:8080
RUN mkdir -p $deployDir
WORKDIR $deployDir
# add /node_modules/.bin` to $PATH
#ENV PATH /frontend/node_modules/.bin:$PATH
# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install
# add app
COPY . .
EXPOSE 3000
# start app
RUN npm install
CMD ["npm", "start"]