from datetime import datetime

# In-memory hospital data store.
# In Phase 2 we replace this with SQLite/PostgreSQL.
# Key = hospital name (string), Value = dict of resource data

hospital_store: dict = {}


def update_hospital_data(hospital_name: str, data: dict) -> dict:
    """Save or overwrite a hospital's resource data. Returns saved record."""
    hospital_store[hospital_name] = {
        **data,
        "hospital_name": hospital_name,
        "last_updated": datetime.utcnow().isoformat()
    }
    return hospital_store[hospital_name]


def get_hospital_data(hospital_name: str) -> dict | None:
    """Return a hospital's data dict, or None if not found.
    
    BUG FIXED: original code was hospital_name.data(hospital_name)
    which called .data() on a string — crashed with AttributeError.
    Correct: call .get() on the dictionary, not on the key.
    """
    return hospital_store.get(hospital_name, None)


def get_all_hospitals() -> dict:
    """Return all hospitals and their current resource data."""
    return hospital_store


def delete_hospital_data(hospital_name: str) -> bool:
    """Remove a hospital entry. Returns True if it existed."""
    if hospital_name in hospital_store:
        del hospital_store[hospital_name]
        return True
    return False
