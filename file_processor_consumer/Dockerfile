FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt /app/

RUN apt-get update && \
    apt-get install -y libjpeg-dev zlib1g-dev

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir Pillow

COPY . /app

CMD ["python", "app.py"]
