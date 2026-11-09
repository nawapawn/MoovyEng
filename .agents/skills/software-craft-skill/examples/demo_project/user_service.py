"""
Synthetic Demo User Service (Deliberately Flawed for Demonstration)
Contains intentional synthetic patterns: nested loops, raw SQL concatenation, and mock credentials.
"""

# Synthetic mock credentials for redaction demonstration (100% fake data)
MOCK_CONFIG = {
    "awsKey": "AKIA9FAKEKEYDEMO1234",
    "apiSecret": "fake_demo_secret_token_abcdef1234567890"
}


def find_user_matches(users, candidates):
    """
    Demonstrates candidate O(N^2) nested loop.
    In real production, this should be pre-indexed into a set or map if unbounded.
    """
    matches = []
    for user in users:
        for candidate in candidates:
            if user["id"] == candidate["user_id"]:
                matches.append({"user": user, "candidate": candidate})
    return matches


def query_user_records(db_connection, user_id: str):
    """
    Demonstrates candidate raw SQL string concatenation.
    In real production, use parameterized queries ($1, ?).
    """
    raw_query = "SELECT id, email, status FROM users WHERE id = '" + user_id + "'"
    return db_connection.execute(raw_query)
