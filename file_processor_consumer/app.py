import os
import pika
import requests
import time
import json
import logging
from io import BytesIO
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Environment variables
RABBIT_URL = os.getenv("RABBIT_URL", "amqp://guest:guest@localhost:5672/")
QUEUE = os.getenv("QUEUE", "files")
FILE_SENDER_API = os.getenv("FILE_SENDER_API", "http://localhost:8082/")
RETRY_TIME = int(os.getenv("RETRY_TIME", 60))  # Max retry time in seconds

# Constants for image resizing
TARGET_WIDTH = 600
TARGET_HEIGHT = 1000

def resize_image(image_data: BytesIO, format: str) -> bytes:
    """
    Resize the image using PIL to a target width and height.
    Returns the resized image as bytes.
    """
    try:
        image = Image.open(image_data)
        image = image.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

        output_buffer = BytesIO()
        image.save(output_buffer, format=format)
        resized_image = output_buffer.getvalue()

        return resized_image
    except Exception as e:
        logger.error(f"Error resizing image: {e}")
        raise

def process_image(key: str, operation: str):
    """
    Download an image, resize it, apply a frame, and upload it back to the service.
    """
    try:
        status_url = f"{FILE_SENDER_API}status"
        retry_count = 0
        max_retries = RETRY_TIME // 5

        while retry_count < max_retries:
            try:
                response = requests.get(status_url)
                response.raise_for_status()
                logger.info("File sender service is available.")
                break
            except requests.RequestException as e:
                logger.warning(f"Failed to fetch status from file sender service. Retrying in 5 seconds... Error: {e}")
                time.sleep(5)
                retry_count += 1
        else:
            logger.error("File sender service is not available after retry attempts. Skipping image processing.")
            return

        download_url = f"{FILE_SENDER_API}?fileKey={key}"
        response = requests.get(download_url)
        response.raise_for_status()

        original_image = Image.open(BytesIO(response.content))
        original_format = original_image.format

        resized_image = resize_image(BytesIO(response.content), original_format)

        image = Image.open(BytesIO(resized_image))

        frame = Image.open(f"{operation}.png")
        image.paste(frame, (0, 0), frame)
        logger.info(f"Applied frame for operation: {operation} on key: {key}")

        output = BytesIO()
        image.save(output, format="PNG")
        output.seek(0)

        files = {
            'fileKey': (None, key),
            'file': ('new_image.png', output, 'image/png')
        }

        # Upload the new image
        upload_url = FILE_SENDER_API
        response = requests.put(upload_url, files=files)
        response.raise_for_status()

        logger.info(f"Successfully processed and uploaded image for key: {key}")
    except Exception as e:
        logger.error(f"Error processing image for key: {key}, operation: {operation}. Error: {e}")

def consume_messages():
    """
    Connect to RabbitMQ, consume messages from the specified queue, and process each image.
    """
    connection = None
    start_time = time.time()

    while time.time() - start_time < RETRY_TIME:
        try:
            connection = pika.BlockingConnection(pika.URLParameters(RABBIT_URL))
            break
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"Connection failed, retrying in 5 seconds... Error: {e}")
            time.sleep(5)

    if not connection:
        logger.error("Failed to connect to RabbitMQ after retrying, exiting.")
        return

    channel = connection.channel()
    channel.queue_declare(queue=QUEUE, durable=True, arguments={'x-queue-type': 'classic'})

    def callback(ch, method, properties, body):
        message = json.loads(body)
        key = message.get('key')
        operation = message.get('operation')
        if key and operation:
            logger.info(f"Received message with key: {key} and operation: {operation}")
            process_image(key, operation)
        else:
            logger.error(f"Invalid message received: {body}")

    channel.basic_consume(queue=QUEUE, on_message_callback=callback, auto_ack=True)
    logger.info(f"Waiting for messages in queue: {QUEUE}")
    channel.start_consuming()

if __name__ == '__main__':
    consume_messages()
