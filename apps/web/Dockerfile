FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3010

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3010"]
