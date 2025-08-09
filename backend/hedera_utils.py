import os
import base64
import requests
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder
import hashlib
from dotenv import load_dotenv

load_dotenv()

HEDERA_BASE_URL = os.getenv("HEDERA_BASE_URL", "https://testnet.mirrornode.hedera.com")
HEDERA_PRIVATE_KEY = os.getenv("HEDERA_PRIVATE_KEY", "")
HEDERA_PUBLIC_KEY = os.getenv("HEDERA_PUBLIC_KEY", "")
HEDERA_ACCOUNT_ID = os.getenv("HEDERA_ACCOUNT_ID", "")


def sha384(data: bytes) -> str:
    """Returns SHA-384 hash in hexadecimal format."""
    return hashlib.sha384(data).hexdigest()


def sign_message(message: bytes) -> str:
    """Signs the message with the private key and returns the signature in hex format."""
    signing_key = SigningKey(HEDERA_PRIVATE_KEY.encode(), encoder=HexEncoder)
    signed = signing_key.sign(message)
    return signed.signature.hex()


def send_hbar(receiver_account_id: str, amount: float) -> dict:
    """
    Dummy placeholder for sending HBAR.
    Integrate with real Hedera SDK or use an API provider like Hashio, Hedera's Mirror Node, or HashPack.
    """
    # Simulate HBAR sending logic
    return {
        "status": "success",
        "sender": HEDERA_ACCOUNT_ID,
        "receiver": receiver_account_id,
        "amount": amount,
        "tx_hash": "dummy_tx_hash_123456"
    }
