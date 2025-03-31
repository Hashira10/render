# Используем базовый образ Python
FROM python:3.10

# Устанавливаем зависимые пакеты для установки Rust
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libssl-dev \
    pkg-config \
    libclang-dev

# Устанавливаем Rust и Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="${PATH}:/root/.cargo/bin"

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы в контейнер
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект в контейнер
COPY . .

# Открываем порт для Django
EXPOSE 8000

# Запускаем сервер разработки Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
