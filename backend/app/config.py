from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    hospital_token: str = "hospital-token"
    coordinator_token: str = "coordinator-token"
    database_url: str = f"sqlite:///{(BASE_DIR / 'data' / 'bloodnet.db').as_posix()}"
    kit_path: Path = BASE_DIR.parent / "participant_kit"
    self_url: str = "http://127.0.0.1:8000"
    gateway_url: str = "http://127.0.0.1:9100"
    travel_url: str = "http://127.0.0.1:9200"
    inventory_url: str = "http://127.0.0.1:9300"
    smart_enabled: bool = True
    request_id_header: str = "X-Request-ID"


settings = Settings()
