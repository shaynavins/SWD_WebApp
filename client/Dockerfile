FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build  # or react-scripts build / vite build

EXPOSE 3000
CMD ["npm", "start"]  # or use serve -s build if static files
