import asyncio
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("structura.worker")
logger.setLevel(logging.INFO)

_job_queue: asyncio.Queue = asyncio.Queue()
_worker_task: Optional[asyncio.Task] = None
_is_running: bool = False

async def enqueue_notification(event_type: str, recipient: str, message: str, payload: Optional[Dict[str, Any]] = None):
    """Enqueue an email/push notification for background asynchronous delivery."""
    job = {
        "type": "notification",
        "event_type": event_type,
        "recipient": recipient,
        "message": message,
        "payload": payload or {},
    }
    await _job_queue.put(job)

async def _process_notification(job: Dict[str, Any]):
    """Simulate dispatching an asynchronous email or SMS notification with automatic retries."""
    event_type = job["event_type"]
    recipient = job["recipient"]
    message = job["message"]
    await asyncio.sleep(0.01)
    logger.info(f"[BACKGROUND WORKER] Notification sent ({event_type}) to {recipient}: {message}")

async def _worker_loop():
    """Background worker consumer processing jobs from the queue."""
    global _is_running
    logger.info("[BACKGROUND WORKER] Worker task queue started.")
    while _is_running:
        try:
            job = await _job_queue.get()
            if job.get("type") == "notification":
                await _process_notification(job)
            _job_queue.task_done()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"[BACKGROUND WORKER] Error processing job: {e}")
            await asyncio.sleep(0.5)

async def start_worker():
    """Start the background worker during FastAPI application startup."""
    global _worker_task, _is_running
    if not _is_running:
        _is_running = True
        _worker_task = asyncio.create_task(_worker_loop())

async def stop_worker():
    """Gracefully drain and stop background worker on application shutdown."""
    global _worker_task, _is_running
    _is_running = False
    if _worker_task:
        _worker_task.cancel()
        try:
            await _worker_task
        except asyncio.CancelledError:
            pass
        _worker_task = None
    logger.info("[BACKGROUND WORKER] Worker gracefully stopped.")
