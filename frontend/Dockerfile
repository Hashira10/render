# Используем базовый образ Node.js
FROM node:16

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы в контейнер
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY . .

# Собираем React-приложение
RUN npm run build

# Запускаем сервер разработки
CMD ["npm", "start"]

# Открываем порт для React
EXPOSE 3000
